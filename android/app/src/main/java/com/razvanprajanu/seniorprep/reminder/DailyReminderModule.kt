package com.razvanprajanu.seniorprep.reminder

import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.razvanprajanu.seniorprep.specs.NativeDailyReminderSpec

/** JS side: src/native/specs/NativeDailyReminder.ts. */
class DailyReminderModule(context: ReactApplicationContext) : NativeDailyReminderSpec(context) {
  override fun getName(): String = NAME

  override fun schedule(
    hour: Double,
    minute: Double,
    title: String,
    body: String,
    channelName: String,
    promise: Promise,
  ) {
    val settings = ReminderSettings(hour.toInt(), minute.toInt(), title, body, channelName)
    ReminderStore.save(reactApplicationContext, settings)
    ReminderAlarm.schedule(reactApplicationContext, settings)
    promise.resolve(null)
  }

  override fun cancel(promise: Promise) {
    ReminderAlarm.cancel(reactApplicationContext)
    ReminderStore.clear(reactApplicationContext)
    promise.resolve(null)
  }

  companion object {
    const val NAME = "DailyReminder"
  }
}
