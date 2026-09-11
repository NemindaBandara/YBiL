package com.example.ybil_mobile.data.remote

import com.example.ybil_mobile.security.SessionManager
import kotlinx.coroutines.runBlocking
import okhttp3.Interceptor
import okhttp3.Response


class AuthInterceptor(
    private val sessionManager: SessionManager
) : Interceptor {

    override fun intercept(
        chain: Interceptor.Chain
    ): Response {

        val token =
            runBlocking {
                sessionManager.getAccessToken()
            }

        val originalRequest =
            chain.request()

        if (token.isNullOrBlank()) {

            return chain.proceed(
                originalRequest
            )
        }

        val authenticatedRequest =
            originalRequest
                .newBuilder()
                .header(
                    "Authorization",
                    "Bearer $token"
                )
                .build()

        return chain.proceed(
            authenticatedRequest
        )
    }
}