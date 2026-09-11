package com.example.ybil_mobile.ui.board

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.ybil_mobile.data.local.entity.TimetableEntryEntity
import com.example.ybil_mobile.data.repository.TimetableRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch

class DepartureBoardViewModel(
    private val repository: TimetableRepository
) : ViewModel() {

    private val _uiState =
        MutableStateFlow(
            DepartureBoardUiState(
                isLoading = true
            )
        )

    val uiState: StateFlow<DepartureBoardUiState> =
        _uiState.asStateFlow()

    init {
        observeLocalTimetable()
        refreshTimetable()
    }

    private fun observeLocalTimetable() {

        viewModelScope.launch {

            repository
                .observeTimetable()
                .collect { entries ->

                    val buses =
                        entries.map { entry ->
                            entry.toBusUiModel()
                        }

                    _uiState.update { currentState ->

                        currentState.copy(
                            buses = buses
                        )
                    }
                }
        }
    }

    fun refreshTimetable() {

        viewModelScope.launch {

            _uiState.update { currentState ->

                currentState.copy(
                    isLoading = true,
                    errorMessage = null
                )
            }

            try {

                repository.syncTimetable()

                _uiState.update { currentState ->

                    currentState.copy(
                        isLoading = false,
                        errorMessage = null
                    )
                }

            } catch (exception: Exception) {

                _uiState.update { currentState ->

                    currentState.copy(
                        isLoading = false,
                        errorMessage =
                            exception.message
                                ?: "Unable to sync timetable"
                    )
                }
            }
        }
    }
}


private fun TimetableEntryEntity.toBusUiModel(): BusUiModel {

    return BusUiModel(
        id = id,
        routeNumber = routeNumber,
        destination = destination,
        operatorType = operatorType,
        busCategory = busCategory,
        busNumber = busNumber,
        parkingTime = scheduledParkingTime,
        leavingTime = scheduledLeavingTime
    )
}