package com.example.ybil_mobile.notification

import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.media.RingtoneManager
import android.os.Build
import androidx.core.app.NotificationCompat
import com.example.ybil_mobile.MainActivity
import com.example.ybil_mobile.R

class NotificationHelper(private val context: Context) {

    companion object {
        const val CHANNEL_ID = "ybil_bus_alerts"
        const val CHANNEL_NAME = "Bus Departure Alerts"
        const val CHANNEL_DESC =
                "Timely notifications for bus bay arrival, countdowns, and departures"
        const val TRIP_NOTIFICATION_ID = 1001

        const val STAGE_PARKED = "STAGE_PARKED"
        const val STAGE_IMMEDIATE = "STAGE_IMMEDIATE"
        const val STAGE_T15 = "STAGE_T15"
        const val STAGE_T5 = "STAGE_T5"
        const val STAGE_T3 = "STAGE_T3"
        const val STAGE_T2 = "STAGE_T2"
        const val STAGE_T1 = "STAGE_T1"
        const val STAGE_LEAVING = "STAGE_LEAVING"
        const val STAGE_MISSED = "STAGE_MISSED"
    }

    private val notificationManager: NotificationManager =
            context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager

    init {
        createNotificationChannel()
    }

    private fun createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val importance = NotificationManager.IMPORTANCE_HIGH
            val channel =
                    NotificationChannel(CHANNEL_ID, CHANNEL_NAME, importance).apply {
                        description = CHANNEL_DESC
                        enableVibration(true)
                        vibrationPattern = longArrayOf(200, 100, 200, 100, 200)
                        setShowBadge(true)
                    }
            notificationManager.createNotificationChannel(channel)
        }
    }

    fun showImmediateStatusNotification(
            busNumber: String,
            routeNumber: String,
            destination: String,
            minutesLeft: Long,
            isParked: Boolean
    ) {
        val title =
                when {
                    minutesLeft <= 0 -> "Bus Departing Now · Colombo Central"
                    minutesLeft <= 3 -> "Final Call · $minutesLeft min left"
                    minutesLeft <= 5 -> "Boarding Alert · $minutesLeft min left"
                    minutesLeft <= 15 -> "Trip Reminder · $minutesLeft min left"
                    isParked -> "Bus Parked at Bay · Colombo Central"
                    else -> "Bus Marked · Route $routeNumber"
                }

        val body =
                when {
                    minutesLeft <= 0 ->
                            "Bus $busNumber to $destination is now departing Colombo Central."
                    minutesLeft <= 3 ->
                            "Bus $busNumber leaves in $minutesLeft minutes! Head to the bus immediately."
                    minutesLeft <= 5 ->
                            "Bus $busNumber leaves in 5 minutes! Gate is preparing to close."
                    minutesLeft <= 15 ->
                            "Bus $busNumber to $destination leaves in $minutesLeft minutes."
                    isParked ->
                            "Bus $busNumber to $destination is parked at bay and ready for boarding."
                    else ->
                            "Bus $busNumber to $destination marked. We will notify you when it parks."
                }

        sendOrUpdateNotification(title = title, body = body)
    }

    fun showStageNotification(
            stage: String,
            busNumber: String,
            routeNumber: String,
            destination: String
    ) {
        val (title, body) =
                when (stage) {
                    STAGE_PARKED ->
                            Pair(
                                    "Bus Arrived at Bay · Colombo Central",
                                    "Bus $busNumber to $destination is now parked and preparing for boarding."
                            )
                    STAGE_T15 ->
                            Pair(
                                    "Trip Reminder · 15m Left",
                                    "Bus $busNumber (Route $routeNumber to $destination) departs in 15 minutes. Head towards the platform."
                            )
                    STAGE_T5 ->
                            Pair(
                                    "Boarding Alert · 5m Left",
                                    "Bus $busNumber leaves in 5 minutes! Final boarding call."
                            )
                    STAGE_T3 ->
                            Pair(
                                    "Final Call · 3m Left",
                                    "Bus $busNumber to $destination leaves in 3 minutes! Gate closing."
                            )
                    STAGE_T2 ->
                            Pair(
                                    "Urgent · 2m Left",
                                    "Bus $busNumber leaves in 2 minutes! Board immediately."
                            )
                    STAGE_T1 ->
                            Pair(
                                    "Imminent Departure · 1m Left",
                                    "Bus $busNumber is departing in 1 minute!"
                            )
                    STAGE_LEAVING ->
                            Pair(
                                    "Departure Notice",
                                    "Bus $busNumber has now departed Colombo Central."
                            )
                    STAGE_MISSED ->
                            Pair(
                                    "Did you miss your bus?",
                                    "Bus $busNumber has left. Tap to view upcoming alternative departures on Route $routeNumber."
                            )
                    else ->
                            Pair(
                                    "Trip Update · Route $routeNumber",
                                    "Bus $busNumber to $destination status update."
                            )
                }

        sendOrUpdateNotification(title = title, body = body)
    }

    private fun sendOrUpdateNotification(title: String, body: String) {
        val intent =
                Intent(context, MainActivity::class.java).apply {
                    flags = Intent.FLAG_ACTIVITY_SINGLE_TOP or Intent.FLAG_ACTIVITY_CLEAR_TOP
                }

        val pendingIntent =
                PendingIntent.getActivity(
                        context,
                        0,
                        intent,
                        PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
                )

        val soundUri = RingtoneManager.getDefaultUri(RingtoneManager.TYPE_NOTIFICATION)

        val notification =
                NotificationCompat.Builder(context, CHANNEL_ID)
                        .setSmallIcon(android.R.drawable.ic_dialog_info)
                        .setContentTitle(title)
                        .setContentText(body)
                        .setStyle(NotificationCompat.BigTextStyle().bigText(body))
                        .setPriority(NotificationCompat.PRIORITY_HIGH)
                        .setCategory(NotificationCompat.CATEGORY_ALARM)
                        .setContentIntent(pendingIntent)
                        .setAutoCancel(true)
                        .setSound(soundUri)
                        .setVibrate(longArrayOf(200, 100, 200, 100, 200))
                        .setOnlyAlertOnce(false)
                        .build()

        notificationManager.notify(TRIP_NOTIFICATION_ID, notification)
    }

    fun dismissNotification() {
        notificationManager.cancel(TRIP_NOTIFICATION_ID)
    }
}
