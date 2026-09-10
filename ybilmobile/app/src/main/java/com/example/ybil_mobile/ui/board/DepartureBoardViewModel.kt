package com.example.ybil_mobile.ui.board

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.ybil_mobile.data.remote.RetrofitClient
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch

class DepartureBoardViewModel : ViewModel() {

    private val _uiState =
        MutableStateFlow(DepartureBoardUiState())

    val uiState: StateFlow<DepartureBoardUiState> =
        _uiState.asStateFlow()

    init {
        loadTimetable()
    }

    fun loadTimetable() {

        viewModelScope.launch {

            _uiState.update {
                it.copy(
                    isLoading = true,
                    errorMessage = null
                )
            }

            try {

                val response =
                    RetrofitClient.api.syncTimetable(
                        since = 0L
                    )

                val buses =
                    response.entries.map { entry ->

                        BusUiModel(
                            id = entry.id,
                            routeNumber =
                                entry.route.routeNumber,
                            destination =
                                entry.route.destination,
                            operatorType =
                                entry.operatorType,
                            parkingTime =
                                entry.scheduledParkingTime,
                            leavingTime =
                                entry.scheduledLeavingTime
                        )
                    }

                _uiState.update {
                    it.copy(
                        buses = buses,
                        isLoading = false,
                        errorMessage = null
                    )
                }

            } catch (exception: Exception) {

                _uiState.update {
                    it.copy(
                        isLoading = false,
                        errorMessage =
                            exception.message
                                ?: "Unknown error"
                    )
                }
            }
        }
    }

    fun toggleMarkedBus(busId: String) {

        _uiState.update { currentState ->

            val newMarkedBusId =
                if (
                    currentState.markedBusId == busId
                ) {
                    null
                } else {
                    busId
                }

            currentState.copy(
                markedBusId = newMarkedBusId
            )
        }
    }
}