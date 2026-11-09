<#
.SYNOPSIS
  Starts the Android emulator and runs the Senior Prep app on it.

.DESCRIPTION
  Compact output: one line per step, summary at the end. Full logs live in
  android\build\run-android\ (emulator.log, build-<mode>.log).

  Steps:
    1. Find the Android SDK.
    2. Reuse the existing emulator (adb OR a qemu process still starting); otherwise delete
       orphaned locks and start the AVD, logging to a file.
    3. Move the window to the primary monitor if it is off-screen (checked again after boot).
    4. Wait for a full boot with an adaptive timeout; if the emulator dies, print the FATAL lines.
    5. Metro on 8081 (warns about a duplicate Metro, does not stop it).
    6. adb reverse.
    7. Build + install ONLY if something native changed (android/, package.json, pnpm-lock.yaml) or
       the app is missing; otherwise just restart the app (JS comes from Metro).
    8. Check the foreground activity + summary.

  Exit codes: 0 OK | 1 SDK/AVD | 2 emulator died | 3 boot timeout |
              4 Metro | 5 build | 6 app not in the foreground

.PARAMETER Mode         dev (default: debug build, .dev package) | prod (release build, needs release signing)
.PARAMETER EmulatorOnly Emulator + Metro only, no build/install.
.PARAMETER SkipBuild    Skip the build; just restart the installed app.
.PARAMETER ForceBuild   Build even if nothing native changed.
.PARAMETER ColdBoot     Boot without the Quick Boot snapshot (automatic if the snapshot is corrupt).
.PARAMETER Gpu         Optional, e.g. 'host' (hardware acceleration). Default: the emulator's choice.
.PARAMETER ResetCache   Start Metro with --reset-cache (restarts a Metro already running on the port).

.EXAMPLE
  powershell -ExecutionPolicy Bypass -File .claude\scripts\run-android.ps1
.EXAMPLE
  powershell -ExecutionPolicy Bypass -File .claude\scripts\run-android.ps1 -Mode prod -ForceBuild
#>
param(
  [string]$Avd = 'Pixel_10_Pro_XL',
  [ValidateSet('dev', 'prod')]
  [string]$Mode = 'dev',
  [switch]$EmulatorOnly,
  [switch]$SkipBuild,
  [switch]$ForceBuild,
  [switch]$ColdBoot,
  [string]$Gpu = '',
  [switch]$ResetCache,
  [int]$MetroPort = 8081,
  [int]$BootTimeoutSeconds = 420
)

# 'Continue' on purpose: in PS 5.1, stderr from adb + 'Stop' = a spurious exception. Errors are handled explicitly.
$ErrorActionPreference = 'Continue'
$ProjectRoot = (Resolve-Path (Join-Path $PSScriptRoot '..\..')).Path
$LogDir = Join-Path $ProjectRoot 'android\build\run-android'
New-Item -ItemType Directory -Force $LogDir | Out-Null
$EmuLog = Join-Path $LogDir 'emulator.log'
$Total = [Diagnostics.Stopwatch]::StartNew()

function Step($n, $msg) { Write-Host "[$n/8] $msg" -ForegroundColor Cyan }
function Fail($code, $msg) { Write-Host "EXIT ${code}: $msg" -ForegroundColor Red; exit $code }

# ---------------------------------------------------------------- 1. SDK
$sdk = if ($env:ANDROID_HOME) { $env:ANDROID_HOME }
       elseif ($env:ANDROID_SDK_ROOT) { $env:ANDROID_SDK_ROOT }
       else { Join-Path $env:LOCALAPPDATA 'Android\Sdk' }
$emulator = Join-Path $sdk 'emulator\emulator.exe'
$adb      = Join-Path $sdk 'platform-tools\adb.exe'
foreach ($p in $emulator, $adb) { if (-not (Test-Path $p)) { Fail 1 "Missing: $p" } }
# The react-native CLI looks for ANDROID_HOME
if (-not $env:ANDROID_HOME) { $env:ANDROID_HOME = $sdk }
# The Android Gradle build is tested with JDK 17: prefer an installed JDK 17 over a newer default JAVA_HOME.
$jdk17 = @(Get-ChildItem 'C:\Program Files\Eclipse Adoptium', 'C:\Program Files\Java', 'C:\Program Files\Microsoft' `
           -Directory -Filter 'jdk-17*' -ErrorAction SilentlyContinue | Sort-Object Name -Descending | Select-Object -First 1)
if ($jdk17.Count -and "$env:JAVA_HOME" -notmatch 'jdk-17') { $env:JAVA_HOME = $jdk17[0].FullName }
Step 1 "SDK: $sdk | JDK: $env:JAVA_HOME"

function Get-EmulatorSerial {
  & $adb devices 2>$null | Select-String -Pattern '^(emulator-\d+)\s+(device|offline)' |
    ForEach-Object { $_.Matches[0].Groups[1].Value } | Select-Object -First 1
}
function Get-Qemu { Get-Process -Name 'qemu-system*' -ErrorAction SilentlyContinue | Select-Object -First 1 }
function Show-EmuFatal {
  foreach ($f in $EmuLog, "$EmuLog.err") {
    if (Test-Path $f) {
      Select-String -Path $f -Pattern 'FATAL|ERROR|PANIC' | Select-Object -Last 8 |
        ForEach-Object { Write-Host "  $($_.Line.Trim())" -ForegroundColor Yellow }
    }
  }
  Write-Host "  Full log: $EmuLog"
}

function Stop-Emu {
  $s = Get-EmulatorSerial
  if ($s) { & $adb -s $s emu kill 2>$null | Out-Null }
  $until = (Get-Date).AddSeconds(20)
  while ((Get-Qemu) -and (Get-Date) -lt $until) { Start-Sleep -Seconds 1 }
  Get-Process -Name 'qemu-system*' -ErrorAction SilentlyContinue | Stop-Process -Force -Confirm:$false -ErrorAction SilentlyContinue
  Start-Sleep -Seconds 2
}

function Start-Emu([bool]$cold) {
  $emuArgs = @('-avd', $Avd, '-netdelay', 'none', '-netspeed', 'full', '-no-boot-anim')
  if ($cold) { $emuArgs += '-no-snapshot-load' }
  if ($Gpu) { $emuArgs += @('-gpu', $Gpu) }
  Start-Process -FilePath $emulator -ArgumentList $emuArgs -WindowStyle Hidden -PassThru `
    -RedirectStandardOutput $EmuLog -RedirectStandardError "$EmuLog.err"
}

# ---------------------------------------------------------------- 2. Emulator
& $adb start-server 2>$null | Out-Null
$serial = Get-EmulatorSerial
$emuProc = $null
if ($serial) {
  Step 2 "Emulator already running: $serial"
} elseif (Get-Qemu) {
  # adb does not see it yet, but the process exists -> do NOT start a second instance of the same AVD
  Step 2 "Emulator starting (qemu PID $((Get-Qemu).Id)), waiting"
} else {
  $avds = @(& $emulator -list-avds 2>$null | Where-Object { $_ -match '\S' })
  if ($avds.Count -eq 0) { Fail 1 'No AVD found. Create one in Android Studio.' }
  if ($avds -notcontains $Avd) {
    if ($avds.Count -eq 1) { $Avd = $avds[0] }
    else { Fail 1 "AVD '$Avd' does not exist. Available: $($avds -join ', ')" }
  }
  # Locks left over after a crash -> the emulator dies with "multiple emulators with the same AVD"
  $avdDir = Join-Path $env:USERPROFILE ".android\avd\$Avd.avd"
  $locks = @(Get-ChildItem $avdDir -Filter '*.lock' -Force -ErrorAction SilentlyContinue)
  foreach ($l in $locks) { Remove-Item $l.FullName -Recurse -Force -Confirm:$false -ErrorAction SilentlyContinue }
  $emuProc = Start-Emu $ColdBoot
  $lockNote = if ($locks.Count) { " (deleted $($locks.Count) orphaned locks)" } else { '' }
  $coldNote = if ($ColdBoot) { ', cold boot' } else { '' }
  Step 2 "Starting $Avd$lockNote$coldNote"
}

# ---------------------------------------------------------------- 3. Window
Add-Type -AssemblyName System.Windows.Forms, System.Drawing
Add-Type -TypeDefinition @'
using System;
using System.Runtime.InteropServices;
public class EmuWin {
  [StructLayout(LayoutKind.Sequential)] public struct RECT { public int Left, Top, Right, Bottom; }
  [DllImport("user32.dll")] public static extern bool GetWindowRect(IntPtr h, out RECT r);
  [DllImport("user32.dll")] public static extern bool MoveWindow(IntPtr h, int x, int y, int w, int ht, bool repaint);
  [DllImport("user32.dll")] public static extern bool SetForegroundWindow(IntPtr h);
  [DllImport("user32.dll")] public static extern bool ShowWindow(IntPtr h, int cmd);
}
'@

# Returns a short message; moves the window to the primary monitor if it does not intersect any screen.
function Repair-EmuWindow([int]$waitSeconds) {
  $deadline = (Get-Date).AddSeconds($waitSeconds)
  do {
    $proc = Get-Process -Name 'qemu-system*' -ErrorAction SilentlyContinue |
            Where-Object { $_.MainWindowHandle -ne 0 } | Select-Object -First 1
    if ($proc) { break }
    Start-Sleep -Milliseconds 1500
  } while ((Get-Date) -lt $deadline)
  if (-not $proc) { return 'window does not exist (headless?)' }
  $h = $proc.MainWindowHandle
  $r = New-Object EmuWin+RECT
  [void][EmuWin]::GetWindowRect($h, [ref]$r)
  $winRect = New-Object System.Drawing.Rectangle($r.Left, $r.Top, ($r.Right - $r.Left), ($r.Bottom - $r.Top))
  $visible = [System.Windows.Forms.Screen]::AllScreens | Where-Object { $_.WorkingArea.IntersectsWith($winRect) }
  $msg = "visible ($($r.Left),$($r.Top))"
  if (-not $visible) {
    $w  = [Math]::Max(420, $r.Right - $r.Left)
    $ht = [Math]::Max(880, $r.Bottom - $r.Top)
    $primary = [System.Windows.Forms.Screen]::PrimaryScreen.WorkingArea
    [void][EmuWin]::ShowWindow($h, 9)   # SW_RESTORE
    [void][EmuWin]::MoveWindow($h, $primary.Left + 60, $primary.Top + 20, $w, $ht, $true)
    $msg = "was off-screen ($($r.Left),$($r.Top)) -> moved"
  }
  [void][EmuWin]::SetForegroundWindow($h)
  return $msg
}
Step 3 "Window: $(Repair-EmuWindow 120)"

# ---------------------------------------------------------------- 4. Boot
# Adaptive timeout: each progress step (listed in adb -> device -> booted) extends the deadline.
$deadline = (Get-Date).AddSeconds($BootTimeoutSeconds)
$phase = 0
$coldRetried = [bool]$ColdBoot
$booted = $false
$bootWatch = [Diagnostics.Stopwatch]::StartNew()
$SnapHangSeconds = 120
while ((Get-Date) -lt $deadline) {
  # Snapshot failed to load but the emulator kept running and never booted (hangs offline):
  # stop it and cold boot once. Also covers an instance left hung by a previous run.
  if (-not $coldRetried -and $bootWatch.Elapsed.TotalSeconds -gt $SnapHangSeconds -and
      (Select-String -Path $EmuLog -Pattern 'Failed to load snapshot' -Quiet -ErrorAction SilentlyContinue)) {
    $coldRetried = $true
    Write-Host '  Quick Boot snapshot failed and the emulator hangs -> stopping it, cold boot (-no-snapshot-load)' -ForegroundColor Yellow
    Stop-Emu
    $emuProc = Start-Emu $true
    $deadline = (Get-Date).AddSeconds($BootTimeoutSeconds)
    $phase = 0
    [void](Repair-EmuWindow 60)
    continue
  }
  if (-not (Get-Qemu) -and ($emuProc -eq $null -or $emuProc.HasExited)) {
    # Corrupt Quick Boot snapshot -> the emulator exits; retry once with a cold boot
    $snapBroken = $emuProc -and -not $coldRetried -and
                  (Select-String -Path $EmuLog, "$EmuLog.err" -Pattern 'Failed to load snapshot|error while loading state' -Quiet -ErrorAction SilentlyContinue)
    if ($snapBroken) {
      $coldRetried = $true
      Write-Host '  corrupt Quick Boot snapshot -> restarting with a cold boot (-no-snapshot-load)' -ForegroundColor Yellow
      $emuProc = Start-Emu $true
      $deadline = (Get-Date).AddSeconds($BootTimeoutSeconds)
      $phase = 0
      [void](Repair-EmuWindow 60)
      continue
    }
    Write-Host 'The emulator stopped during boot:' -ForegroundColor Red
    Show-EmuFatal
    Fail 2 'the emulator died'
  }
  $serial = Get-EmulatorSerial
  $newPhase = 0
  if ($serial) {
    $newPhase = 1
    if ((& $adb -s $serial get-state 2>$null) -eq 'device') {
      $newPhase = 2
      if ("$(& $adb -s $serial shell getprop sys.boot_completed 2>$null)".Trim() -eq '1') { $booted = $true; break }
    }
  }
  if ($newPhase -gt $phase) {
    $phase = $newPhase
    $extended = (Get-Date).AddSeconds(180)
    if ($extended -gt $deadline) { $deadline = $extended }
  }
  Start-Sleep -Seconds 2
}
if (-not $booted) {
  Show-EmuFatal
  Fail 3 "boot not finished (last phase: $(@('not listed in adb','offline','device without boot_completed')[$phase]))"
}
# The emulator may move its window off-screen after boot -> check again
Step 4 "Boot OK: $serial ($([int]$bootWatch.Elapsed.TotalSeconds)s); window: $(Repair-EmuWindow 5)"

# ---------------------------------------------------------------- 5. Metro
function Test-Metro($port) {
  try {
    # A busy Metro may answer /status only after 2-3 s -> generous timeout
    $c = (Invoke-WebRequest -UseBasicParsing -TimeoutSec 8 "http://localhost:$port/status").Content
    # Metro does not send a text Content-Type, so PS 5.1 returns byte[]
    if ($c -is [byte[]]) { $c = [System.Text.Encoding]::UTF8.GetString($c) }
    "$c" -match 'packager-status:running'
  } catch { $false }
}
$others = 8082..8089 | Where-Object {
  Get-NetTCPConnection -LocalPort $_ -State Listen -ErrorAction SilentlyContinue
}
if ($others) {
  Write-Warning "Servers on ports: $($others -join ', ') (possibly a duplicate Metro). Not stopping them - check manually."
}
# --reset-cache only applies at Metro startup -> restart our own Metro on the port
$metroRestarted = $false
if ($ResetCache -and ($listener = Get-NetTCPConnection -LocalPort $MetroPort -State Listen -ErrorAction SilentlyContinue | Select-Object -First 1)) {
  $cmdLine = (Get-CimInstance Win32_Process -Filter "ProcessId=$($listener.OwningProcess)" -ErrorAction SilentlyContinue).CommandLine
  if ("$cmdLine" -notmatch 'react-native.*\sstart') { Fail 4 "port $MetroPort is used by a process other than Metro: $cmdLine" }
  Stop-Process -Id $listener.OwningProcess -Force -Confirm:$false -ErrorAction SilentlyContinue
  Start-Sleep -Seconds 2
  $metroRestarted = $true
}
$metroCmd = "pnpm exec react-native start --port $MetroPort"
if ($ResetCache) { $metroCmd += ' --reset-cache' }
if (Test-Metro $MetroPort) {
  Step 5 "Metro already running on $MetroPort"
} elseif ($listener = Get-NetTCPConnection -LocalPort $MetroPort -State Listen -ErrorAction SilentlyContinue | Select-Object -First 1) {
  $cmdLine = (Get-CimInstance Win32_Process -Filter "ProcessId=$($listener.OwningProcess)" -ErrorAction SilentlyContinue).CommandLine
  if ("$cmdLine" -match 'react-native.*\sstart') {
    Step 5 "Metro on $MetroPort (PID $($listener.OwningProcess)) does not answer /status - using it anyway"
  } else {
    Fail 4 "port $MetroPort is used by a process other than Metro: $cmdLine"
  }
} else {
  Start-Process -FilePath 'cmd.exe' `
    -ArgumentList @('/k', $metroCmd) `
    -WorkingDirectory $ProjectRoot
  $deadline = (Get-Date).AddSeconds(60)
  while (-not (Test-Metro $MetroPort) -and (Get-Date) -lt $deadline) { Start-Sleep -Seconds 2 }
  if (-not (Test-Metro $MetroPort)) { Fail 4 'Metro did not start within 60 s (see the Metro window)' }
  $cacheNote = if ($metroRestarted) { ' (restarted, cache reset)' } elseif ($ResetCache) { ' (cache reset)' } else { '' }
  Step 5 "Metro started on $MetroPort$cacheNote"
}

# ---------------------------------------------------------------- 6. adb reverse
& $adb -s $serial reverse "tcp:$MetroPort" "tcp:$MetroPort" 2>$null | Out-Null
Step 6 "adb reverse tcp:$MetroPort"

if ($EmulatorOnly) {
  Write-Host "DONE (-EmulatorOnly): $serial, Metro $MetroPort, $([int]$Total.Elapsed.TotalSeconds)s" -ForegroundColor Green
  exit 0
}

# ---------------------------------------------------------------- 7. Build / install
$modeArgs  = @{ dev = ''; prod = '--mode release' }[$Mode]
$package   = @{ dev = 'com.razvanprajanu.seniorprep.dev'; prod = 'com.razvanprajanu.seniorprep' }[$Mode]
$activity  = 'com.razvanprajanu.seniorprep.MainActivity'
$stampFile = Join-Path $LogDir "native-$Mode.stamp"
$buildLog  = Join-Path $LogDir "build-$Mode.log"

# Quick fingerprint (path|size|mtime) of the native inputs; a false positive only triggers a build.
function Get-NativeStamp {
  $skipDirs = '\\(build|\.gradle|\.kotlin|\.cxx)\\'
  $files = @(Get-ChildItem (Join-Path $ProjectRoot 'android') -Recurse -File -Force -ErrorAction SilentlyContinue |
             Where-Object { $_.FullName -notmatch $skipDirs })
  $files += @('package.json', 'pnpm-lock.yaml') |
            ForEach-Object { Join-Path $ProjectRoot $_ } | Where-Object { Test-Path $_ } | ForEach-Object { Get-Item $_ }
  $text = ($files | Sort-Object FullName |
           ForEach-Object { "$($_.FullName)|$($_.Length)|$($_.LastWriteTimeUtc.Ticks)" }) -join "`n"
  $sha = [Security.Cryptography.SHA256]::Create()
  [BitConverter]::ToString($sha.ComputeHash([Text.Encoding]::UTF8.GetBytes("$Mode`n$text"))) -replace '-', ''
}

$installed = [bool](& $adb -s $serial shell pm path $package 2>$null)
$stamp = Get-NativeStamp
$stampOk = (Test-Path $stampFile) -and ((Get-Content $stampFile -Raw).Trim() -eq $stamp)

$reason = if ($ForceBuild) { '-ForceBuild' }
          elseif (-not $installed) { 'app not installed' }
          elseif ($SkipBuild) { $null }
          elseif (-not $stampOk) { 'native changes' }
          else { $null }
if ($SkipBuild -and -not $installed) { Fail 5 "-SkipBuild, but $package is not installed on $serial" }

if ($reason) {
  Step 7 "Build $Mode ($reason) -> log: $buildLog"
  # The RN CLI runs "gradlew.bat" without a path; with this variable set, cmd.exe does not search the current directory.
  Remove-Item Env:NoDefaultCurrentDirectoryInExePath -ErrorAction SilentlyContinue
  $bw = [Diagnostics.Stopwatch]::StartNew()
  Push-Location $ProjectRoot
  # Through cmd so the log stays UTF-8 (PS 5.1 redirection writes UTF-16)
  cmd.exe /c "pnpm android $modeArgs --port $MetroPort --device $serial --no-packager > `"$buildLog`" 2>&1"
  $code = $LASTEXITCODE
  Pop-Location
  if ($code -ne 0) {
    $errs = @(Select-String -Path $buildLog -Pattern '(^e: |error:|FAILURE|What went wrong|BUILD FAILED|^error )' |
              Select-Object -First 20)
    if ($errs.Count) { $errs | ForEach-Object { Write-Host "  $($_.Line.Trim())" -ForegroundColor Yellow } }
    else { Get-Content $buildLog -Tail 30 | ForEach-Object { Write-Host "  $_" } }
    Fail 5 "build failed (exit $code), log: $buildLog"
  }
  Set-Content -Path $stampFile -Value $stamp -Encoding ascii
  Write-Host "  BUILD OK ($([int]$bw.Elapsed.TotalSeconds)s)" -ForegroundColor Green
} else {
  Step 7 'No build (nothing native changed) -> restarting the app'
  & $adb -s $serial shell am start -S -W -n "$package/$activity" 2>$null | Out-Null
}

# ---------------------------------------------------------------- 8. Verification
$top = ''
for ($i = 0; $i -lt 5 -and $top -notmatch [regex]::Escape($package); $i++) {
  Start-Sleep -Seconds 2
  $top = (& $adb -s $serial shell dumpsys activity activities 2>$null |
          Select-String -Pattern 'topResumedActivity' | Select-Object -First 1).Line
}
if ($top -notmatch [regex]::Escape($package)) { Fail 6 "app is not in the foreground: $("$top".Trim())" }
Step 8 "In foreground: $package/$activity"
Write-Host "DONE: $serial | $Mode | Metro $MetroPort | $([int]$Total.Elapsed.TotalSeconds)s" -ForegroundColor Green
exit 0
