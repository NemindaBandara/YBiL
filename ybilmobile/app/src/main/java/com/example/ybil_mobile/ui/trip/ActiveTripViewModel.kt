package com.example.ybil_mobile.ui.trip

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.ybil_mobile.data.remote.dto.MarkedTripResponseDto
import com.example.ybil_mobile.data.repository.TripRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import retrofit2.HttpException
import java.io.IOException

class ActiveTripViewModel(
    private val repository:
    TripRepository
) : ViewModel() {

    private val _uiState =
        MutableStateFlow(
            ActiveTripUiState()
        )

    val uiState:
            StateFlow<ActiveTripUiState> =
        _uiState.asStateFlow()


    fun loadActiveTrip() {

        viewModelScope.launch {

            _uiState.update {
                it.copy(
                    isLoading = true,
                    errorMessage = null
                )
            }

            try {

                val activeTrip =
                    repository.getActiveTrip()

                _uiState.update {
                    it.copy(
                        activeTrip =
                            activeTrip
                                ?.toUiModel(),
                        isLoading = false,
                        errorMessage = null
                    )
                }

            } catch (exception: Exception) {

                _uiState.update {
                    it.copy(
                        isLoading = false,
                        errorMessage =
                            tripErrorMessage(
                                exception
                            )
                    )
                }
            }
        }
    }


    fun markTrip(
        timetableEntryId: String
    ) {

        viewModelScope.launch {

            _uiState.update {
                it.copy(
                    isLoading = true,
                    errorMessage = null
                )
            }

            try {

                val trip =
                    repository.markTrip(
                        timetableEntryId
                    )

                _uiState.update {
                    it.copy(
                        activeTrip =
                            trip.toUiModel(),
                        isLoading = false,
                        errorMessage = null
                    )
                }

            } catch (exception: Exception) {

                _uiState.update {
                    it.copy(
                        isLoading = false,
                        errorMessage =
                            tripErrorMessage(
                                exception
                            )
                    )
                }
            }
        }
    }


    fun cancelActiveTrip() {

        val trip =
            _uiState.value.activeTrip
                ?: return

        viewModelScope.launch {

            _uiState.update {
                it.copy(
                    isLoading = true,
                    errorMessage = null
                )
            }

            try {

                repository.cancelTrip(
                    tripId =
                        trip.tripId
                )

                _uiState.update {
                    it.copy(
                        activeTrip = null,
                        isLoading = false,
                        errorMessage = null
                    )
                }

            } catch (exception: Exception) {

                _uiState.update {
                    it.copy(
                        isLoading = false,
                        errorMessage =
                            tripErrorMessage(
                                exception
                            )
                    )
                }
            }
        }
    }


    fun clearLocalState() {

        _uiState.value =
            ActiveTripUiState()
    }


    private fun tripErrorMessage(
        exception: Exception
    ): String {

        return when (exception) {

            is HttpException -> {

                when (exception.code()) {

                    401 ->
                        "Your session has expired. Please login again."

                    404 ->
                        "This trip could not be found."

                    else ->
                        "Trip request failed (${exception.code()})."
                }
            }

            is IOException ->
                "Unable to connect to the server."

            else ->
                exception.message
                    ?: "Unable to update trip."
        }
    }
}


private fun MarkedTripResponseDto.toUiModel():
        ActiveTripUiModel {

    return ActiveTripUiModel(
        tripId = id,
        timetableEntryId =
            timetableEntry.id,
        routeNumber =
            timetableEntry.route.routeNumber,
        destination =
            timetableEntry.route.destination,
        operatorType =
            timetableEntry.operatorType,
        busCategory =
            timetableEntry.busCategory,
        busNumber =
            timetableEntry.busNumber,
        parkingTime =
            timetableEntry.scheduledParkingTime,
        leavingTime =
            timetableEntry.scheduledLeavingTime,
        status =
            status
    )
}