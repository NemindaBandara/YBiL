package com.example.ybil_mobile.data.remote

import com.example.ybil_mobile.security.SessionManager
import okhttp3.OkHttpClient
import okhttp3.logging.HttpLoggingInterceptor
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory


object RetrofitClient {

    private const val BASE_URL =
        "http://127.0.0.1:8080/"


    private val loggingInterceptor =
        HttpLoggingInterceptor().apply {

            level =
                HttpLoggingInterceptor.Level.BASIC
        }


    private val publicOkHttpClient =
        OkHttpClient
            .Builder()
            .addInterceptor(
                loggingInterceptor
            )
            .build()


    private fun createRetrofit(
        client: OkHttpClient
    ): Retrofit {

        return Retrofit
            .Builder()
            .baseUrl(BASE_URL)
            .client(client)
            .addConverterFactory(
                GsonConverterFactory.create()
            )
            .build()
    }


    val api: YBiLApiService by lazy {

        createRetrofit(
            publicOkHttpClient
        ).create(
            YBiLApiService::class.java
        )
    }


    fun createAuthenticatedApi(
        sessionManager: SessionManager
    ): YBiLApiService {

        val authenticatedClient =
            OkHttpClient
                .Builder()
                .addInterceptor(
                    AuthInterceptor(
                        sessionManager
                    )
                )
                .addInterceptor(
                    loggingInterceptor
                )
                .build()

        return createRetrofit(
            authenticatedClient
        ).create(
            YBiLApiService::class.java
        )
    }
}