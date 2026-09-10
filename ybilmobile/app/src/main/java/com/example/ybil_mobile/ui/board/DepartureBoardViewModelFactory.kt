package com.example.ybil_mobile.ui.board

import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import com.example.ybil_mobile.data.repository.TimetableRepository

class DepartureBoardViewModelFactory(
    private val repository: TimetableRepository
) : ViewModelProvider.Factory {

    override fun <T : ViewModel> create(
        modelClass: Class<T>
    ): T {

        if (
            modelClass.isAssignableFrom(
                DepartureBoardViewModel::class.java
            )
        ) {

            @Suppress("UNCHECKED_CAST")
            return DepartureBoardViewModel(
                repository = repository
            ) as T
        }

        throw IllegalArgumentException(
            "Unknown ViewModel class: ${modelClass.name}"
        )
    }
}