package com.example.ybil_mobile

import android.app.Application
import com.example.ybil_mobile.data.local.YBiLDatabase
import com.example.ybil_mobile.data.remote.RetrofitClient
import com.example.ybil_mobile.data.repository.TimetableRepository
import com.example.ybil_mobile.data.repository.TimetableRepositoryImpl

class YBiLApplication : Application() {

    val database: YBiLDatabase by lazy {
        YBiLDatabase.getDatabase(this)
    }

    val timetableRepository: TimetableRepository by lazy {
        TimetableRepositoryImpl(
            apiService = RetrofitClient.api,
            database = database
        )
    }
}