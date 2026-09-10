package com.example.ybil_mobile.ui.board

data class DepartureBoardUiState(
    val buses: List<BusUiModel> = emptyList(),
    val markedBusId: String? = null,
    val isLoading: Boolean = false,
    val errorMessage: String? = null
)