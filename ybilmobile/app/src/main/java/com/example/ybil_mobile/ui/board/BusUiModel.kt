package com.example.ybil_mobile.ui.board

data class BusUiModel(
    val id: String,
    val routeNumber: String,
    val destination: String,
    val operatorType: String,
    val parkingTime: String,
    val leavingTime: String
)