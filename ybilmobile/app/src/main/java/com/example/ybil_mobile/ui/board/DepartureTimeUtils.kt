package com.example.ybil_mobile.ui.board

import java.time.LocalTime
import java.time.temporal.ChronoUnit

fun calculateMinutesUntilDeparture(
    leavingTime: String,
    currentTime: LocalTime
): Long {

    val departureTime =
        LocalTime.parse(leavingTime)

    val currentMinute =
        currentTime.truncatedTo(
            ChronoUnit.MINUTES
        )

    return ChronoUnit.MINUTES.between(
        currentMinute,
        departureTime
    )
}


fun calculateDepartureStatus(
    leavingTime: String,
    currentTime: LocalTime
): DepartureStatus {
    return try {
        val minutesUntilDeparture =
            calculateMinutesUntilDeparture(
                leavingTime = leavingTime,
                currentTime = currentTime
            )

        when {
            minutesUntilDeparture > 15 ->
                DepartureStatus.UPCOMING

            minutesUntilDeparture in 1..15 ->
                DepartureStatus.URGENT

            minutesUntilDeparture == 0L ->
                DepartureStatus.LEAVING_NOW

            else ->
                DepartureStatus.DEPARTED
        }
    } catch (_: Exception) {
        DepartureStatus.HIDDEN
    }
}