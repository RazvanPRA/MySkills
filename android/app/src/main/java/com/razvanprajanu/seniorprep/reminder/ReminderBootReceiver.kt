package com.razvanprajanu.seniorprep.reminder

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent

/**
 * Alarms do not survive a reboot or an app update, and a time zone change moves "20:00":
 * re-arm the reminder in all of these cases.
 */
class ReminderBootReceiver : BroadcastReceiver() {
  override fun onReceive(context: Context, intent: Intent) {
    if (intent.action in RESCHEDULE_ACTIONS) {
      ReminderStore.load(context)?.let { ReminderAlarm.schedule(context, it) }
    }
  }

  private companion object {
    val RESCHEDULE_ACTIONS =
      setOf(
        Intent.ACTION_BOOT_COMPLETED,
        Intent.ACTION_MY_PACKAGE_REPLACED,
        Intent.ACTION_TIME_CHANGED,
        Intent.ACTION_TIMEZONE_CHANGED,
      )
  }
}
