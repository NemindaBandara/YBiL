package com.example.ybil_mobile.notification

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent

class DepartureAlarmReceiver : BroadcastReceiver() {

    companion object {
        const val ACTION_DEPARTURE_ALERT = "com.example.ybil_mobile.ACTION_DEPARTURE_ALERT"
        const val EXTRA_STAGE = "extra_stage"
        const val EXTRA_BUS_NUMBER = "extra_bus_number"
        const val EXTRA_ROUTE_NUMBER = "extra_route_number"
        const val EXTRA_DESTINATION = "extra_destination"
    }

    override fun onReceive(context: Context, intent: Intent?) {
        if (intent == null || intent.action != ACTION_DEPARTURE_ALERT) return

        val stage = intent.getStringExtra(EXTRA_STAGE) ?: return
        val busNumber = intent.getStringExtra(EXTRA_BUS_NUMBER) ?: "Assigned Bus"
        val routeNumber = intent.getStringExtra(EXTRA_ROUTE_NUMBER) ?: ""
        val destination = intent.getStringExtra(EXTRA_DESTINATION) ?: "Terminal"

        val helper = NotificationHelper(context)
        helper.showStageNotification(
                stage = stage,
                busNumber = busNumber,
                routeNumber = routeNumber,
                destination = destination
        )
    }
}
