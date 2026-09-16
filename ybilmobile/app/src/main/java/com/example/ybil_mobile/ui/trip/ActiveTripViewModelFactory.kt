package com.example.ybil_mobile.ui.trip

import android.content.Context
import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import com.example.ybil_mobile.data.repository.TripRepository

class ActiveTripViewModelFactory(
    private val repository: TripRepository,
    private val context: Context
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
                repository = repository,
                context = context
            ) as T
        }

        throw IllegalArgumentException(
            "Unknown ViewModel class"
        )
    }
}
