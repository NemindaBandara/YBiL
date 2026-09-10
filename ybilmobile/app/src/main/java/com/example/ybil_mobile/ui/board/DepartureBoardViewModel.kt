package com.example.ybil_mobile.ui.board

import androidx.lifecycle.ViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow

class DepartureBoardViewModel : ViewModel() {

    private val fakeBuses = listOf(
        BusUiModel(
            id = "bus-138-0830",
            routeNumber = "138",
            destination = "Maharagama",
            operatorType = "SLTB",
            parkingTime = "08:15",
            leavingTime = "08:30"
        ),
        BusUiModel(
            id = "bus-100-0900",
            routeNumber = "100",
            destination = "Panadura",
            operatorType = "PRIVATE",
            parkingTime = "08:45",
            leavingTime = "09:00"
        ),
        BusUiModel(
            id = "bus-02-0915",
            routeNumber = "02",
            destination = "Galle",
            operatorType = "SLTB",
            parkingTime = "09:00",
            leavingTime = "09:15"
        )
    )

    private val _uiState = MutableStateFlow(
        DepartureBoardUiState(
            buses = fakeBuses
        )
    )

    val uiState: StateFlow<DepartureBoardUiState> =
        _uiState.asStateFlow()

    fun toggleMarkedBus(busId: String) {

        val currentMarkedBusId =
            _uiState.value.markedBusId

        val newMarkedBusId =
            if (currentMarkedBusId == busId) {
                null
            } else {
                busId
            }

        _uiState.value = _uiState.value.copy(
            markedBusId = newMarkedBusId
        )
    }
}