package com.example.ybil_mobile.ui.trip

import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import com.example.ybil_mobile.data.repository.TripRepository

class ActiveTripViewModelFactory(
    private val repository:
    TripRepository
) : ViewModelProvider.Factory {

    override fun <T : ViewModel> create(
        modelClass: Class<T>
    ): T {

        if (
            modelClass.isAssignableFrom(
                ActiveTripViewModel::class.java
            )
        ) {

            @Suppress("UNCHECKED_CAST")
            return ActiveTripViewModel(
                repository = repository
            ) as T
        }

        throw IllegalArgumentException(
            "Unknown ViewModel class"
        )
    }
}