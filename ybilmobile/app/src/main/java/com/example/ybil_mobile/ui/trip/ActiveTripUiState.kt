package com.example.ybil_mobile.ui.trip

data class ActiveTripUiState(
    val activeTrip:
    ActiveTripUiModel? = null,

    val isLoading:
    Boolean = false,

    val errorMessage:
    String? = null
)