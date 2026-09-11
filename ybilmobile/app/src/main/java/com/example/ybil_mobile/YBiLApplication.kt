package com.example.ybil_mobile

import android.app.Application
import com.example.ybil_mobile.data.local.YBiLDatabase
import com.example.ybil_mobile.data.remote.RetrofitClient
import com.example.ybil_mobile.data.repository.TimetableRepository
import com.example.ybil_mobile.data.repository.TimetableRepositoryImpl
import com.example.ybil_mobile.data.repository.AuthRepository
import com.example.ybil_mobile.data.repository.AuthRepositoryImpl
import com.example.ybil_mobile.security.SessionManager
import com.example.ybil_mobile.data.repository.TripRepository
import com.example.ybil_mobile.data.repository.TripRepositoryImpl

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

    val sessionManager by lazy {
        SessionManager(this)
    }

    val authenticatedApi by lazy {

        RetrofitClient
            .createAuthenticatedApi(
                sessionManager
            )
    }

    val authRepository:
            AuthRepository by lazy {

        AuthRepositoryImpl(
            publicApi =
                RetrofitClient.api,

            authenticatedApi =
                authenticatedApi,

            sessionManager =
                sessionManager
        )
    }

    val tripRepository:
            TripRepository by lazy {

        TripRepositoryImpl(
            authenticatedApi =
                authenticatedApi
        )
    }
}