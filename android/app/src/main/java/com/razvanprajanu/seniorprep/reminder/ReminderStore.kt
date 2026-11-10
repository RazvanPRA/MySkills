package com.razvanprajanu.seniorprep.reminder

import android.content.Context

/** What the reminder needs after a reboot, when JavaScript is not running. */
data class ReminderSettings(
  val hour: Int,
  val minute: Int,
  val title: String,
  val body: String,
  val channelName: String,
)

/** The scheduled reminder in SharedPreferences; null when reminders are off. */
object ReminderStore {
  private const val PREFS = "senior_prep_reminder"

  fun save(context: Context, settings: ReminderSettings) {
    prefs(context)
      .edit()
      .putInt("hour", settings.hour)
      .putInt("minute", settings.minute)
      .putString("title", settings.title)
      .putString("body", settings.body)
      .putString("channelName", settings.channelName)
      .apply()
  }

  fun clear(context: Context) {
    prefs(context).edit().clear().apply()
  }

  fun load(context: Context): ReminderSettings? {
    val prefs = prefs(context)
    if (!prefs.contains("hour")) return null
    return ReminderSettings(
      hour = prefs.getInt("hour", 0),
      minute = prefs.getInt("minute", 0),
      title = prefs.getString("title", null).orEmpty(),
      body = prefs.getString("body", null).orEmpty(),
      channelName = prefs.getString("channelName", null).orEmpty(),
    )
  }

  private fun prefs(context: Context) = context.getSharedPreferences(PREFS, Context.MODE_PRIVATE)
}
