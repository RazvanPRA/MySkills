package com.razvanprajanu.seniorprep.reminder

import android.Manifest
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.net.Uri
import android.os.Build
import androidx.core.app.NotificationCompat
import androidx.core.app.NotificationManagerCompat
import androidx.core.content.ContextCompat
import com.razvanprajanu.seniorprep.R

/** Posts the daily reminder, then arms the alarm for the next day. */
class ReminderReceiver : BroadcastReceiver() {
  override fun onReceive(context: Context, intent: Intent) {
    val settings = ReminderStore.load(context) ?: return
    if (canNotify(context)) {
      createChannel(context, settings.channelName)
      NotificationManagerCompat.from(context).notify(NOTIFICATION_ID, build(context, settings))
    }
    ReminderAlarm.schedule(context, settings)
  }

  private fun canNotify(context: Context): Boolean =
    Build.VERSION.SDK_INT < Build.VERSION_CODES.TIRAMISU ||
      ContextCompat.checkSelfPermission(context, Manifest.permission.POST_NOTIFICATIONS) ==
      PackageManager.PERMISSION_GRANTED

  private fun createChannel(context: Context, name: String) {
    if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) return
    val channel = NotificationChannel(CHANNEL_ID, name, NotificationManager.IMPORTANCE_DEFAULT)
    context.getSystemService(NotificationManager::class.java).createNotificationChannel(channel)
  }

  private fun build(context: Context, settings: ReminderSettings) =
    NotificationCompat.Builder(context, CHANNEL_ID)
      .setSmallIcon(R.drawable.ic_notification)
      .setContentTitle(settings.title)
      .setContentText(settings.body)
      .setContentIntent(openToday(context))
      .setAutoCancel(true)
      .setCategory(NotificationCompat.CATEGORY_REMINDER)
      .build()

  /** Opens the app on Today through the same deep link as everywhere else. */
  private fun openToday(context: Context): PendingIntent {
    val open =
      Intent(Intent.ACTION_VIEW, Uri.parse(TODAY_LINK))
        .setPackage(context.packageName)
        .addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
    return PendingIntent.getActivity(
      context,
      0,
      open,
      PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE,
    )
  }

  companion object {
    private const val CHANNEL_ID = "daily_reminder"
    private const val NOTIFICATION_ID = 1
    private const val TODAY_LINK = "seniorprep://today"
  }
}
