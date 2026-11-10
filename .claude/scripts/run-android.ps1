<#
.SYNOPSIS
  Starts the Android emulator and runs the Senior Prep app on it.

.DESCRIPTION
  Compact output: one line per step, summary at the end. Full logs live in
  android\build\run-android\ (emulator.log, build-<mode>.log).

  Steps:
    1. Find the Android SDK.
    2. Reuse the existing emulator (adb OR a qemu process still starting); otherwise delete
       orphaned locks and start the AVD, logging to a file. -WipeData stops a running one first.
    3. Move the window to the primary monitor if it is off-screen (DPI-aware; re-checked during
       and after boot, because the emulator can move its own window later).
    4. Wait for a full boot with an adaptive timeout; if the emulator dies, print the FATAL lines;
       detect a kernel-panic boot loop (corrupt userdata) instead of waiting for the timeout.
    5. Metro on $MetroPort (warns about a duplicate Metro, does not stop it). Skipped in prod.
    6. adb reverse. Skipped in prod.
    7. Build + install ONLY if an input changed or the app is missing; otherwise just restart the app.
       dev:  inputs = android/, package.json, pnpm-lock.yaml, react-native.config.js, Metro port
             (JS comes from Metro).
       prod: the same + the JS sources (the bundle is inside the APK).
    8. Check the foreground activity + summary.

  Exit codes: 0 OK | 1 SDK/AVD | 2 emulator died | 3 boot timeout |
              4 Metro | 5 build | 6 app not in the foreground | 7 boot loop (kernel panic) |
              8 another run of this script is in progress

.PARAMETER Mode         dev (default: debug build, .dev package) | prod (release build, needs release signing)
.PARAMETER EmulatorOnly Emulator + Metro only, no build/install.
.PARAMETER SkipBuild    Skip the build; just restart the installed app.
.PARAMETER ForceBuild   Build even if nothing changed.
.PARAMETER ColdBoot     Boot without the Quick Boot snapshot (automatic if the snapshot is corrupt).
.PARAMETER WipeData     Factory-reset the AVD (-wipe-data). ERASES the emulator's data. Use it after exit 7.
.PARAMETER Gpu          Default 'host' (hardware GPU). With an old GPU driver the emulator's own choice
                        ('auto') falls back to software rendering, which makes boot extremely slow.
.PARAMETER ResetCache   Start Metro with --reset-cache (restarts a Metro already running on the port).

.EXAMPLE
  powershell -ExecutionPolicy Bypass -File .claude\scripts\run-android.ps1
.EXAMPLE
  powershell -ExecutionPolicy Bypass -File .claude\scripts\run-android.ps1 -Mode prod -ForceBuild
.EXAMPLE
  powershell -ExecutionPolicy Bypass -File .claude\scripts\run-android.ps1 -EmulatorOnly -WipeData
#>
param(
  [string]$Avd = 'Pixel_10_Pro_XL',
  [ValidateSet('dev', 'prod')]
  [string]$Mode = 'dev',
  [switch]$EmulatorOnly,
  [switch]$SkipBuild,
  [switch]$ForceBuild,
  [switch]$ColdBoot,
  [switch]$WipeData,
  [string]$Gpu = 'host',
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

# One run at a time per project: two runs share the emulator, Metro, the build log and the stamp file
# (the second build cannot even open build-<mode>.log). The OS releases the mutex when the process exits.
$RunMutex = New-Object Threading.Mutex($false, "Local\run-android-$(($ProjectRoot -replace '[^A-Za-z0-9]', '_').ToLower())")
try { $acquired = $RunMutex.WaitOne(0) } catch [Threading.AbandonedMutexException] { $acquired = $true }
if (-not $acquired) {
  $other = Get-CimInstance Win32_Process -Filter "Name='powershell.exe' OR Name='pwsh.exe'" -ErrorAction SilentlyContinue |
           Where-Object { $_.ProcessId -ne $PID -and "$($_.CommandLine)" -match 'run-android\.ps1' } | Select-Object -First 1
  $who = if ($other) { " (PID $($other.ProcessId): $($other.CommandLine))" } else { '' }
  Fail 8 "another run-android.ps1 is already running$who. Wait for it or stop it."
}

# ---------------------------------------------------------------- 1. SDK
$sdk = if ($env:ANDROID_HOME) { $env:ANDROID_HOME }
       elseif ($env:ANDROID_SDK_ROOT) { $env:ANDROID_SDK_ROOT }
       else { Join-Path $env:LOCALAPPDATA 'Android\Sdk' }
$emulator = Join-Path $sdk 'emulator\emulator.exe'
$adb      = Join-Path $sdk 'platform-tools\adb.exe'
foreach ($p in $emulator, $adb) { if (-not (Test-Path $p)) { Fail 1 "Missing: $p" } }
# The react-native CLI looks for ANDROID_HOME
if (-not $env:ANDROID_HOME) { $env:ANDROID_HOME = $sdk }
# The Android Gradle build is tested with JDK 17: prefer the newest installed JDK 17 over a newer default JAVA_HOME.
# Sort by [version], not by name: as text, 'jdk-17.0.9' sorts above 'jdk-17.0.12'.
function Get-JdkVersion($dir) {
  if ($dir.Name -notmatch '^jdk-(\d+(?:\.\d+){0,3})') { return [version]'0.0' }
  $text = $Matches[1]
  if ($text -notlike '*.*') { $text += '.0' }   # [version] needs at least major.minor
  try { [version]$text } catch { [version]'0.0' }
}
$jdk17 = @(Get-ChildItem 'C:\Program Files\Eclipse Adoptium', 'C:\Program Files\Java', 'C:\Program Files\Microsoft' `
           -Directory -Filter 'jdk-17*' -ErrorAction SilentlyContinue |
           Where-Object { Test-Path (Join-Path $_.FullName 'bin\java.exe') } |
           Sort-Object { Get-JdkVersion $_ } -Descending | Select-Object -First 1)
if ($jdk17.Count -and "$env:JAVA_HOME" -notmatch 'jdk-17') { $env:JAVA_HOME = $jdk17[0].FullName }
Step 1 "SDK: $sdk | JDK: $env:JAVA_HOME"

# AVD folder: respects the same variables as the emulator itself
$AvdHome = if ($env:ANDROID_AVD_HOME) { $env:ANDROID_AVD_HOME }
           elseif ($env:ANDROID_USER_HOME) { Join-Path $env:ANDROID_USER_HOME 'avd' }
           elseif ($env:ANDROID_SDK_HOME) { Join-Path $env:ANDROID_SDK_HOME '.android\avd' }
           else { Join-Path $env:USERPROFILE '.android\avd' }

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

# Sends commands to the emulator console (telnet port). Works even when adb sees the device as offline.
function Invoke-EmuConsole([int]$port, [string[]]$commands) {
  $tokenFile = Join-Path $env:USERPROFILE '.emulator_console_auth_token'
  try {
    $client = New-Object Net.Sockets.TcpClient('127.0.0.1', $port)
    $writer = New-Object IO.StreamWriter($client.GetStream())
    $writer.NewLine = "`n"; $writer.AutoFlush = $true
    Start-Sleep -Milliseconds 300
    if (Test-Path $tokenFile) {
      $writer.WriteLine("auth $((Get-Content $tokenFile -Raw).Trim())")
      Start-Sleep -Milliseconds 300
    }
    foreach ($c in $commands) { $writer.WriteLine($c); Start-Sleep -Milliseconds 300 }
    $client.Close()
    $true
  } catch { $false }
}

# Graceful stop first: a forced kill of qemu can corrupt userdata (-> kernel-panic boot loop on the next start).
function Stop-Emu {
  $s = Get-EmulatorSerial
  $port = if ($s -match '^emulator-(\d+)$') { [int]$Matches[1] } else { 5554 }
  [void](Invoke-EmuConsole $port @('kill'))
  $until = (Get-Date).AddSeconds(30)
  while ((Get-Qemu) -and (Get-Date) -lt $until) { Start-Sleep -Seconds 1 }
  if (Get-Qemu) {
    Write-Host '  the emulator did not stop gracefully -> forced kill' -ForegroundColor Yellow
    Get-Process -Name 'qemu-system*' -ErrorAction SilentlyContinue | Stop-Process -Force -Confirm:$false -ErrorAction SilentlyContinue
  }
  Start-Sleep -Seconds 2
}

# Locks left over after a crash or a forced kill -> the emulator dies with "multiple emulators with the same AVD".
# Called before EVERY start (also the automatic cold-boot retries), and only when no qemu is running.
function Remove-AvdLocks {
  $avdDir = Join-Path $AvdHome "$Avd.avd"
  $locks = @(Get-ChildItem $avdDir -Filter '*.lock' -Force -ErrorAction SilentlyContinue)
  foreach ($l in $locks) { Remove-Item $l.FullName -Recurse -Force -Confirm:$false -ErrorAction SilentlyContinue }
  $locks.Count
}

function Start-Emu([bool]$cold, [bool]$wipe) {
  $emuArgs = @('-avd', $Avd, '-netdelay', 'none', '-netspeed', 'full', '-no-boot-anim')
  if ($cold -or $wipe) { $emuArgs += '-no-snapshot-load' }
  if ($wipe) { $emuArgs += '-wipe-data' }
  if ($Gpu) { $emuArgs += @('-gpu', $Gpu) }
  Start-Process -FilePath $emulator -ArgumentList $emuArgs -WindowStyle Hidden -PassThru `
    -RedirectStandardOutput $EmuLog -RedirectStandardError "$EmuLog.err"
}

# ---------------------------------------------------------------- 2. Emulator
& $adb start-server 2>$null | Out-Null
$serial = Get-EmulatorSerial
$emuProc = $null
if ($WipeData -and ($serial -or (Get-Qemu))) {
  Write-Host '  -WipeData: stopping the running emulator first' -ForegroundColor Yellow
  Stop-Emu
  $serial = $null
}
if ($serial) {
  Step 2 "Emulator already running: $serial"
} elseif (Get-Qemu) {
  # adb does not see it yet, but the process exists -> do NOT start a second instance of the same AVD
  Step 2 "Emulator starting (qemu PID $((Get-Qemu).Id)), waiting"
} else {
  # Newer emulators may print 'INFO | ...' lines with -list-avds; AVD names never contain spaces or '|'.
  $avds = @(& $emulator -list-avds 2>$null | ForEach-Object { "$_".Trim() } | Where-Object { $_ -match '^[^\s|]+$' })
  if ($avds.Count -eq 0) { Fail 1 'No AVD found. Create one in Android Studio.' }
  if ($avds -notcontains $Avd) {
    if ($avds.Count -eq 1) { $Avd = $avds[0] }
    else { Fail 1 "AVD '$Avd' does not exist. Available: $($avds -join ', ')" }
  }
  $lockCount = Remove-AvdLocks
  $emuProc = Start-Emu $ColdBoot $WipeData
  $lockNote = if ($lockCount) { " (deleted $lockCount orphaned locks)" } else { '' }
  $bootNote = if ($WipeData) { ', WIPE DATA' } elseif ($ColdBoot) { ', cold boot' } else { '' }
  Step 2 "Starting $Avd$lockNote$bootNote, gpu=$(if ($Gpu) { $Gpu } else { 'auto' })"
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
  [DllImport("user32.dll")] public static extern bool SetProcessDPIAware();
}
'@
# Without this, on mixed-DPI multi-monitor setups Windows returns virtualized coordinates for both the
# window and the screens, and an off-screen window can be reported as visible.
[void][EmuWin]::SetProcessDPIAware()

function Test-EmuDead { -not (Get-Qemu) -and ($null -eq $emuProc -or $emuProc.HasExited) }

function Get-EmuRect($h) {
  $r = New-Object EmuWin+RECT
  [void][EmuWin]::GetWindowRect($h, [ref]$r)
  $r
}

# Returns a short message; moves the window to the primary monitor if less than half of it is on a screen.
# The size is preserved (the emulator sizes itself to the AVD's aspect ratio).
function Repair-EmuWindow([int]$waitSeconds, [switch]$Focus) {
  $deadline = (Get-Date).AddSeconds($waitSeconds)
  do {
    $proc = Get-Process -Name 'qemu-system*' -ErrorAction SilentlyContinue |
            Where-Object { $_.MainWindowHandle -ne 0 } | Select-Object -First 1
    if ($proc) { break }
    if (Test-EmuDead) { return 'no emulator process' }
    if ($waitSeconds -gt 0) { Start-Sleep -Milliseconds 1500 }
  } while ((Get-Date) -lt $deadline)
  if (-not $proc) { return 'window does not exist (headless?)' }
  $h = $proc.MainWindowHandle
  $r = Get-EmuRect $h
  if ($r.Left -le -32000) {
    # Minimized: restore first, then measure the real rectangle
    [void][EmuWin]::ShowWindow($h, 9)   # SW_RESTORE
    Start-Sleep -Milliseconds 300
    $r = Get-EmuRect $h
  }
  $winRect = New-Object System.Drawing.Rectangle($r.Left, $r.Top, ($r.Right - $r.Left), ($r.Bottom - $r.Top))
  $area = [Math]::Max(1, $winRect.Width * $winRect.Height)
  $visibleArea = 0
  foreach ($s in [System.Windows.Forms.Screen]::AllScreens) {
    $i = [System.Drawing.Rectangle]::Intersect($s.WorkingArea, $winRect)
    $visibleArea += [Math]::Max(0, $i.Width) * [Math]::Max(0, $i.Height)
  }
  $msg = "visible ($($r.Left),$($r.Top))"
  if ($visibleArea / $area -lt 0.5) {
    $primary = [System.Windows.Forms.Screen]::PrimaryScreen.WorkingArea
    [void][EmuWin]::ShowWindow($h, 9)   # SW_RESTORE
    [void][EmuWin]::MoveWindow($h, $primary.Left + 60, $primary.Top + 20, $winRect.Width, $winRect.Height, $true)
    $msg = "was off-screen ($($r.Left),$($r.Top)) -> moved"
    $Focus = $true
  }
  if ($Focus) { [void][EmuWin]::SetForegroundWindow($h) }
  return $msg
}
Step 3 "Window: $(Repair-EmuWindow 120 -Focus)"

# ---------------------------------------------------------------- 4. Boot
# Adaptive timeout: each progress step (listed in adb -> device -> booted) extends the deadline.
$deadline = (Get-Date).AddSeconds($BootTimeoutSeconds)
$phase = 0
$lastPhase = 0
$drops = 0              # device -> offline/missing transitions: adbd restarting = the guest is rebooting
$panicReason = $null
$iteration = 0
$coldRetried = [bool]($ColdBoot -or $WipeData)
$booted = $false
$bootWatch = [Diagnostics.Stopwatch]::StartNew()
$SnapHangSeconds = 120
while ((Get-Date) -lt $deadline) {
  $iteration++
  # Snapshot failed to load but the emulator kept running and never booted (hangs offline):
  # stop it and cold boot once. Only for an emulator THIS run started: otherwise emulator.log is stale.
  if ($emuProc -and -not $coldRetried -and $bootWatch.Elapsed.TotalSeconds -gt $SnapHangSeconds -and
      (Select-String -Path $EmuLog -Pattern 'Failed to load snapshot' -Quiet -ErrorAction SilentlyContinue)) {
    $coldRetried = $true
    Write-Host '  Quick Boot snapshot failed and the emulator hangs -> stopping it, cold boot (-no-snapshot-load)' -ForegroundColor Yellow
    Stop-Emu
    [void](Remove-AvdLocks)
    $emuProc = Start-Emu $true $false
    $deadline = (Get-Date).AddSeconds($BootTimeoutSeconds)
    $phase = 0; $lastPhase = 0; $drops = 0
    [void](Repair-EmuWindow 60)
    continue
  }
  if (Test-EmuDead) {
    # Corrupt Quick Boot snapshot -> the emulator exits; retry once with a cold boot
    $snapBroken = $emuProc -and -not $coldRetried -and
                  (Select-String -Path $EmuLog, "$EmuLog.err" -Pattern 'Failed to load snapshot|error while loading state' -Quiet -ErrorAction SilentlyContinue)
    if ($snapBroken) {
      $coldRetried = $true
      Write-Host '  corrupt Quick Boot snapshot -> restarting with a cold boot (-no-snapshot-load)' -ForegroundColor Yellow
      [void](Remove-AvdLocks)
      $emuProc = Start-Emu $true $false
      $deadline = (Get-Date).AddSeconds($BootTimeoutSeconds)
      $phase = 0; $lastPhase = 0; $drops = 0
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
      # sys.boot.reason = why the PREVIOUS boot ended. kernel_panic + adbd restarting again and again = boot loop.
      if ($lastPhase -ne 2 -and -not $panicReason) {
        $br = "$(& $adb -s $serial shell getprop sys.boot.reason 2>$null)".Trim()
        if ($br -match 'kernel_panic') { $panicReason = $br }
      }
      if ("$(& $adb -s $serial shell getprop sys.boot_completed 2>$null)".Trim() -eq '1') { $booted = $true; break }
    }
  }
  if ($lastPhase -eq 2 -and $newPhase -lt 2) { $drops++ }
  $lastPhase = $newPhase
  if ($panicReason -and $drops -ge 2) {
    Fail 7 ("boot loop: the guest kernel keeps panicking ($panicReason). Usually a corrupt userdata " +
            "partition after a forced kill. Rerun with -WipeData (ERASES the emulator's data).")
  }
  if ($newPhase -gt $phase) {
    $phase = $newPhase
    $extended = (Get-Date).AddSeconds(180)
    if ($extended -gt $deadline) { $deadline = $extended }
  }
  # The emulator can move its window off-screen after start-up: re-check every ~10 s, without stealing focus
  if ($iteration % 5 -eq 0) { [void](Repair-EmuWindow 0) }
  Start-Sleep -Seconds 2
}
if (-not $booted) {
  Show-EmuFatal
  $hint = if ($panicReason) { " Last boot reason: $panicReason -> try -WipeData." } else { '' }
  Fail 3 "boot not finished (last phase: $(@('not listed in adb','offline','device without boot_completed')[$phase])).$hint"
}
Step 4 "Boot OK: $serial ($([int]$bootWatch.Elapsed.TotalSeconds)s); window: $(Repair-EmuWindow 5 -Focus)"

# ---------------------------------------------------------------- 5. Metro
# A release build carries its JS bundle inside the APK: Metro and adb reverse are not needed.
$needMetro = $EmulatorOnly -or $Mode -eq 'dev'

function Test-Metro($port) {
  try {
    # A busy Metro may answer /status only after 2-3 s -> generous timeout
    $c = (Invoke-WebRequest -UseBasicParsing -TimeoutSec 8 "http://localhost:$port/status").Content
    # Metro does not send a text Content-Type, so PS 5.1 returns byte[]
    if ($c -is [byte[]]) { $c = [System.Text.Encoding]::UTF8.GetString($c) }
    "$c" -match 'packager-status:running'
  } catch { $false }
}
function Get-Listener($port) {
  Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue | Select-Object -First 1
}
function Get-CommandLine($processId) {
  "$((Get-CimInstance Win32_Process -Filter "ProcessId=$processId" -ErrorAction SilentlyContinue).CommandLine)"
}
# Stops Metro together with the 'cmd /k' window a previous run opened for it (otherwise the windows pile up).
function Stop-MetroTree($processId) {
  $target = $processId
  $current = $processId
  for ($i = 0; $i -lt 4; $i++) {
    $self = Get-CimInstance Win32_Process -Filter "ProcessId=$current" -ErrorAction SilentlyContinue
    if (-not $self) { break }
    $parent = Get-CimInstance Win32_Process -Filter "ProcessId=$($self.ParentProcessId)" -ErrorAction SilentlyContinue
    if (-not $parent) { break }
    if ($parent.Name -eq 'cmd.exe' -and "$($parent.CommandLine)" -match 'react-native\s+start') { $target = $parent.ProcessId; break }
    $current = $parent.ProcessId
  }
  & taskkill.exe /PID $target /T /F 2>$null | Out-Null
}

if (-not $needMetro) {
  Step 5 'Metro not needed (prod: the JS bundle is inside the APK)'
} else {
  $others = 8081..8089 | Where-Object { $_ -ne $MetroPort -and (Get-Listener $_) }
  if ($others) {
    Write-Warning "Servers on ports: $($others -join ', ') (possibly a duplicate Metro). Not stopping them - check manually."
  }
  # --reset-cache only applies at Metro startup -> restart our own Metro on the port
  $metroRestarted = $false
  if ($ResetCache -and ($listener = Get-Listener $MetroPort)) {
    $cmdLine = Get-CommandLine $listener.OwningProcess
    if ($cmdLine -notmatch 'react-native.*\sstart') { Fail 4 "port $MetroPort is used by a process other than Metro: $cmdLine" }
    Stop-MetroTree $listener.OwningProcess
    Start-Sleep -Seconds 2
    $metroRestarted = $true
  }
  $metroCmd = "pnpm exec react-native start --port $MetroPort"
  if ($ResetCache) { $metroCmd += ' --reset-cache' }
  if (Test-Metro $MetroPort) {
    Step 5 "Metro already running on $MetroPort"
  } elseif ($listener = Get-Listener $MetroPort) {
    $cmdLine = Get-CommandLine $listener.OwningProcess
    if ($cmdLine -match 'react-native.*\sstart') {
      Step 5 "Metro on $MetroPort (PID $($listener.OwningProcess)) does not answer /status - using it anyway"
    } else {
      Fail 4 "port $MetroPort is used by a process other than Metro: $cmdLine"
    }
  } else {
    Start-Process -FilePath 'cmd.exe' `
      -ArgumentList @('/k', $metroCmd) `
      -WorkingDirectory $ProjectRoot
    $metroDeadline = (Get-Date).AddSeconds(60)
    while (-not (Test-Metro $MetroPort) -and (Get-Date) -lt $metroDeadline) { Start-Sleep -Seconds 2 }
    if (-not (Test-Metro $MetroPort)) { Fail 4 'Metro did not start within 60 s (see the Metro window)' }
    $cacheNote = if ($metroRestarted) { ' (restarted, cache reset)' } elseif ($ResetCache) { ' (cache reset)' } else { '' }
    Step 5 "Metro started on $MetroPort$cacheNote"
  }
}

# ---------------------------------------------------------------- 6. adb reverse
if ($needMetro) {
  & $adb -s $serial reverse "tcp:$MetroPort" "tcp:$MetroPort" 2>$null | Out-Null
  if ($LASTEXITCODE -ne 0) { Write-Warning "adb reverse tcp:$MetroPort failed - the app may not reach Metro" }
  Step 6 "adb reverse tcp:$MetroPort"
} else {
  Step 6 'adb reverse not needed (prod)'
}

if ($EmulatorOnly) {
  Write-Host "DONE (-EmulatorOnly): $serial, Metro $MetroPort, $([int]$Total.Elapsed.TotalSeconds)s" -ForegroundColor Green
  exit 0
}

# ---------------------------------------------------------------- 7. Build / install
# dev: build.gradle adds applicationIdSuffix ".dev" for debug. Without --appIdSuffix the RN CLI installs fine
# but then launches com.razvanprajanu.seniorprep (no suffix) -> "Activity class does not exist" -> exit 1.
$modeArgs  = @{ dev = '--appIdSuffix dev'; prod = '--mode release' }[$Mode]
$package   = @{ dev = 'com.razvanprajanu.seniorprep.dev'; prod = 'com.razvanprajanu.seniorprep' }[$Mode]
$activity  = 'com.razvanprajanu.seniorprep.MainActivity'
$stampFile = Join-Path $LogDir "native-$Mode.stamp"
$buildLog  = Join-Path $LogDir "build-$Mode.log"

# Recursive listing that does not descend into generated folders (much faster than filtering afterwards).
$SkipDirNames = @('build', '.gradle', '.kotlin', '.cxx', '.idea', 'node_modules')
function Get-InputFiles([string]$dir) {
  if (-not (Test-Path $dir)) { return }
  Get-ChildItem $dir -File -Force -ErrorAction SilentlyContinue
  Get-ChildItem $dir -Directory -Force -ErrorAction SilentlyContinue |
    Where-Object { $SkipDirNames -notcontains $_.Name } |
    ForEach-Object { Get-InputFiles $_.FullName }
}

# Quick fingerprint (path|size|mtime) of the build inputs; a false positive only triggers a build.
# The Metro port is included: the RN Gradle plugin bakes it into the debug APK (react_native_dev_server_port).
function Get-BuildStamp {
  $dirs  = @('android')
  $files = @('package.json', 'pnpm-lock.yaml', 'react-native.config.js')
  if ($Mode -eq 'prod') {
    # Release: the JS bundle is inside the APK, so JS changes also require a build
    $dirs  += @('src', 'content')
    $files += @('index.js', 'app.json', 'babel.config.js', 'metro.config.js', 'tsconfig.json')
  }
  $all = @($dirs | ForEach-Object { Get-InputFiles (Join-Path $ProjectRoot $_) })
  $all += @($files | ForEach-Object { Join-Path $ProjectRoot $_ } | Where-Object { Test-Path $_ } | ForEach-Object { Get-Item $_ })
  $text = ($all | Sort-Object FullName |
           ForEach-Object { "$($_.FullName)|$($_.Length)|$($_.LastWriteTimeUtc.Ticks)" }) -join "`n"
  $sha = [Security.Cryptography.SHA256]::Create()
  [BitConverter]::ToString($sha.ComputeHash([Text.Encoding]::UTF8.GetBytes("$Mode|$MetroPort`n$text"))) -replace '-', ''
}

$installed = [bool](& $adb -s $serial shell pm path $package 2>$null)
$stamp = Get-BuildStamp
$stampOk = (Test-Path $stampFile) -and ((Get-Content $stampFile -Raw).Trim() -eq $stamp)

if ($SkipBuild -and $ForceBuild) { Write-Warning '-SkipBuild and -ForceBuild together: -ForceBuild wins' }
$reason = if ($ForceBuild) { '-ForceBuild' }
          elseif (-not $installed) { 'app not installed' }
          elseif ($SkipBuild) { $null }
          elseif (-not $stampOk) { if ($Mode -eq 'prod') { 'sources changed' } else { 'native changes' } }
          else { $null }
if ($SkipBuild -and -not $ForceBuild -and -not $installed) { Fail 5 "-SkipBuild, but $package is not installed on $serial" }

if ($reason) {
  Step 7 "Build $Mode ($reason) -> log: $buildLog"
  # The RN CLI runs "gradlew.bat" without a path; with this variable set, cmd.exe does not search the current directory.
  Remove-Item Env:NoDefaultCurrentDirectoryInExePath -ErrorAction SilentlyContinue
  $bw = [Diagnostics.Stopwatch]::StartNew()
  Push-Location $ProjectRoot
  # Through cmd so the log stays UTF-8 (PS 5.1 redirection writes UTF-16).
  # --active-arch-only: native code only for the emulator's ABI (x86_64), not all 4 -> much faster CMake builds.
  # The distributable APK is built by `pnpm build:apk`, not by this script.
  cmd.exe /c "pnpm android $modeArgs --port $MetroPort --device $serial --no-packager --active-arch-only > `"$buildLog`" 2>&1"
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
  $why = if ($Mode -eq 'prod') { 'nothing changed' } else { 'nothing native changed' }
  Step 7 "No build ($why) -> restarting the app"
  & $adb -s $serial shell am start -S -W -n "$package/$activity" 2>$null | Out-Null
}

# ---------------------------------------------------------------- 8. Verification
# Match "<package>/" exactly: a plain prefix match would accept the .dev app in prod mode.
$packageRx = [regex]::Escape("$package/")
$top = ''
for ($i = 0; $i -lt 5 -and $top -notmatch $packageRx; $i++) {
  Start-Sleep -Seconds 2
  $top = (& $adb -s $serial shell dumpsys activity activities 2>$null |
          Select-String -Pattern 'topResumedActivity' | Select-Object -First 1).Line
}
if ($top -notmatch $packageRx) { Fail 6 "app is not in the foreground: $("$top".Trim())" }
Step 8 "In foreground: $package/$activity"
Write-Host "DONE: $serial | $Mode | Metro $(if ($needMetro) { $MetroPort } else { '-' }) | $([int]$Total.Elapsed.TotalSeconds)s" -ForegroundColor Green
exit 0
