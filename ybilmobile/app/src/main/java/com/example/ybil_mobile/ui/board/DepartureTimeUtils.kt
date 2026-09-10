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

    val minutesUntilDeparture =
        calculateMinutesUntilDeparture(
            leavingTime = leavingTime,
            currentTime = currentTime
        )

    return when {

        minutesUntilDeparture > 15 ->
            DepartureStatus.UPCOMING

        minutesUntilDeparture in 1..15 ->
            DepartureStatus.URGENT

        minutesUntilDeparture == 0L ->
            DepartureStatus.LEAVING_NOW

        minutesUntilDeparture in -15L..-1L ->
            DepartureStatus.DEPARTED

        else ->
            DepartureStatus.HIDDEN
    }
}