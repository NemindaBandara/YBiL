package com.example.ybil_mobile.ui.trip

import com.example.ybil_mobile.ui.board.BusUiModel

data class ActiveTripUiModel(
    val tripId: String,
    val timetableEntryId: String,
    val routeNumber: String,
    val destination: String,
    val operatorType: String,
    val busCategory: String,
    val busNumber: String?,
    val parkingTime: String,
    val leavingTime: String,
    val status: String
)

data class MissedBusFallbackUiModel(
    val missedTripId: String,
    val message: String,
    val alternatives: List<BusUiModel>
)
