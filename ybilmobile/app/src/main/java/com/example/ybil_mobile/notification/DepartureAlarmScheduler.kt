package com.example.ybil_mobile.notification

import android.app.AlarmManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.os.Build
import java.time.LocalDate
import java.time.LocalDateTime
import java.time.LocalTime
import java.time.ZoneId
import java.time.temporal.ChronoUnit

object DepartureAlarmScheduler {

    private const val REQUEST_CODE_PARKED = 101
    private const val REQUEST_CODE_T15 = 102
    private const val REQUEST_CODE_T5 = 103
    private const val REQUEST_CODE_T3 = 104
    private const val REQUEST_CODE_T2 = 105
    private const val REQUEST_CODE_T1 = 106
    private const val REQUEST_CODE_LEAVING = 107

    private val ALL_REQUEST_CODES =
            listOf(
                    REQUEST_CODE_PARKED,
                    REQUEST_CODE_T15,
                    REQUEST_CODE_T5,
                    REQUEST_CODE_T3,
                    REQUEST_CODE_T2,
                    REQUEST_CODE_T1,
                    REQUEST_CODE_LEAVING
            )

    fun scheduleTripAlarms(
            context: Context,
            tripId: String,
            busNumber: String,
            routeNumber: String,
            destination: String,
            parkingTimeStr: String,
            leavingTimeStr: String
    ) {
        cancelTripAlarms(context)

        val alarmManager =
                context.getSystemService(Context.ALARM_SERVICE) as? AlarmManager ?: return
        val now = LocalTime.now()
        val today = LocalDate.now()
        val zone = ZoneId.systemDefault()
        val nowMillis = System.currentTimeMillis()

        val parkingTime = parseTimeOrNull(parkingTimeStr) ?: return
        val leavingTime = parseTimeOrNull(leavingTimeStr) ?: return

        val diffMinutesToLeaving = ChronoUnit.MINUTES.between(now, leavingTime)
        val isParkedNow = !now.isBefore(parkingTime) && now.isBefore(leavingTime)

        // 1. Immediately post current status notification so user sees instant confirmation without
        // delay
        val notificationHelper = NotificationHelper(context)
        notificationHelper.showImmediateStatusNotification(
                busNumber = busNumber,
                routeNumber = routeNumber,
                destination = destination,
                minutesLeft = diffMinutesToLeaving,
                isParked = isParkedNow
        )

        // 2. Compute epoch targets for future stages
        val leavingDateTime = LocalDateTime.of(today, leavingTime)
        val parkingDateTime = LocalDateTime.of(today, parkingTime)

        val leavingEpoch = leavingDateTime.atZone(zone).toInstant().toEpochMilli()
        val parkingEpoch = parkingDateTime.atZone(zone).toInstant().toEpochMilli()

        val stages =
                listOf(
                        Triple(REQUEST_CODE_PARKED, NotificationHelper.STAGE_PARKED, parkingEpoch),
                        Triple(
                                REQUEST_CODE_T15,
                                NotificationHelper.STAGE_T15,
                                leavingEpoch - (15 * 60 * 1000L)
                        ),
                        Triple(
                                REQUEST_CODE_T5,
                                NotificationHelper.STAGE_T5,
                                leavingEpoch - (5 * 60 * 1000L)
                        ),
                        Triple(
                                REQUEST_CODE_T3,
                                NotificationHelper.STAGE_T3,
                                leavingEpoch - (3 * 60 * 1000L)
                        ),
                        Triple(
                                REQUEST_CODE_T2,
                                NotificationHelper.STAGE_T2,
                                leavingEpoch - (2 * 60 * 1000L)
                        ),
                        Triple(
                                REQUEST_CODE_T1,
                                NotificationHelper.STAGE_T1,
                                leavingEpoch - (1 * 60 * 1000L)
                        ),
                        Triple(REQUEST_CODE_LEAVING, NotificationHelper.STAGE_LEAVING, leavingEpoch)
                )

        // 3. Schedule ONLY milestones that are strictly in the future (at least 5 seconds away)
        val canScheduleExact =
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
                    alarmManager.canScheduleExactAlarms()
                } else {
                    true
                }

        for ((requestCode, stage, triggerMillis) in stages) {
            if (triggerMillis > nowMillis + 5000L) {
                val intent =
                        Intent(context, DepartureAlarmReceiver::class.java).apply {
                            action = DepartureAlarmReceiver.ACTION_DEPARTURE_ALERT
                            putExtra(DepartureAlarmReceiver.EXTRA_STAGE, stage)
                            putExtra(DepartureAlarmReceiver.EXTRA_BUS_NUMBER, busNumber)
                            putExtra(DepartureAlarmReceiver.EXTRA_ROUTE_NUMBER, routeNumber)
                            putExtra(DepartureAlarmReceiver.EXTRA_DESTINATION, destination)
                        }

                val pendingIntent =
                        PendingIntent.getBroadcast(
                                context,
                                requestCode,
                                intent,
                                PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
                        )

                try {
                    if (canScheduleExact) {
                        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                            alarmManager.setExactAndAllowWhileIdle(
                                    AlarmManager.RTC_WAKEUP,
                                    triggerMillis,
                                    pendingIntent
                            )
                        } else {
                            alarmManager.setExact(
                                    AlarmManager.RTC_WAKEUP,
                                    triggerMillis,
                                    pendingIntent
                            )
                        }
                    } else {
                        // Fallback to inexact if exact alarm permission not yet granted
                        alarmManager.set(AlarmManager.RTC_WAKEUP, triggerMillis, pendingIntent)
                    }
                } catch (e: SecurityException) {
                    // Fallback to standard alarm
                    alarmManager.set(AlarmManager.RTC_WAKEUP, triggerMillis, pendingIntent)
                }
            }
        }
    }

    fun cancelTripAlarms(context: Context) {
        val alarmManager =
                context.getSystemService(Context.ALARM_SERVICE) as? AlarmManager ?: return

        for (requestCode in ALL_REQUEST_CODES) {
            val intent =
                    Intent(context, DepartureAlarmReceiver::class.java).apply {
                        action = DepartureAlarmReceiver.ACTION_DEPARTURE_ALERT
                    }
            val pendingIntent =
                    PendingIntent.getBroadcast(
                            context,
                            requestCode,
                            intent,
                            PendingIntent.FLAG_NO_CREATE or PendingIntent.FLAG_IMMUTABLE
                    )
            if (pendingIntent != null) {
                alarmManager.cancel(pendingIntent)
                pendingIntent.cancel()
            }
        }

        NotificationHelper(context).dismissNotification()
    }

    private fun parseTimeOrNull(timeStr: String): LocalTime? {
        return try {
            val parts = timeStr.trim().split(":")
            if (parts.size >= 2) {
                LocalTime.of(parts[0].toInt(), parts[1].toInt())
            } else null
        } catch (e: Exception) {
            null
        }
    }
}
