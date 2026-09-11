package com.example.ybil_mobile.ui.trip

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