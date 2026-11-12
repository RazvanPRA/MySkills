package com.razvanprajanu.seniorprep.reminder

import android.app.AlarmManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import java.util.Calendar

/**
 * One alarm at a time, re-armed for the next day after each reminder. An inexact window
 * needs no exact-alarm permission and follows daylight saving changes (each day is
 * computed again in the local time zone).
 */
object ReminderAlarm {
  /** The reminder may arrive up to 10 minutes after the chosen time (battery friendly). */
  private const val WINDOW_MS = 10 * 60 * 1000L

  fun schedule(
    context: Context,
    settings: ReminderSettings,
    now: Long = System.currentTimeMillis(),
  ) {
    val trigger = nextTrigger(now, settings.hour, settings.minute)
    alarmManager(context)
      .setWindow(AlarmManager.RTC_WAKEUP, trigger, WINDOW_MS, pendingIntent(context))
  }

  fun cancel(context: Context) {
    alarmManager(context).cancel(pendingIntent(context))
  }

  /** The next local HH:MM strictly after `now`. */
  fun nextTrigger(now: Long, hour: Int, minute: Int): Long {
    val calendar =
      Calendar.getInstance().apply {
        timeInMillis = now
        set(Calendar.HOUR_OF_DAY, hour)
        set(Calendar.MINUTE, minute)
        set(Calendar.SECOND, 0)
        set(Calendar.MILLISECOND, 0)
      }
    if (calendar.timeInMillis <= now) {
      calendar.add(Calendar.DAY_OF_YEAR, 1)
    }
    return calendar.timeInMillis
  }

  private fun alarmManager(context: Context) = context.getSystemService(AlarmManager::class.java)

  private fun pendingIntent(context: Context): PendingIntent =
    PendingIntent.getBroadcast(
      context,
      0,
      Intent(context, ReminderReceiver::class.java),
      PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE,
    )
}
