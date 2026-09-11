package com.example.ybil_mobile.data.repository

import com.example.ybil_mobile.data.remote.YBiLApiService
import com.example.ybil_mobile.data.remote.dto.AuthRequestDto
import com.example.ybil_mobile.data.remote.dto.AuthUserDto
import com.example.ybil_mobile.security.SessionManager
import com.example.ybil_mobile.security.UserSession
import kotlinx.coroutines.flow.Flow


class AuthRepositoryImpl(
    private val publicApi:
    YBiLApiService,

    private val authenticatedApi:
    YBiLApiService,

    private val sessionManager:
    SessionManager
) : AuthRepository {


    override val session:
            Flow<UserSession> =
        sessionManager.sessionFlow


    override suspend fun login(
        username: String,
        password: String
    ): AuthUserDto {

        val authResponse =
            publicApi.login(
                AuthRequestDto(
                    username = username,
                    password = password
                )
            )

        /*
         * Save the access token first.
         *
         * This is necessary because the next call,
         * /api/auth/me, requires Bearer authentication.
         */
        sessionManager.saveTokens(
            authResponse
        )

        val user =
            authenticatedApi
                .getCurrentUser()

        sessionManager.saveUser(
            user
        )

        return user
    }


    override suspend fun register(
        username: String,
        password: String
    ): AuthUserDto {

        val authResponse =
            publicApi.register(
                AuthRequestDto(
                    username = username,
                    password = password
                )
            )

        sessionManager.saveTokens(
            authResponse
        )

        val user =
            authenticatedApi
                .getCurrentUser()

        sessionManager.saveUser(
            user
        )

        return user
    }


    override suspend fun getCurrentUser():
            AuthUserDto {

        return authenticatedApi
            .getCurrentUser()
    }


    override suspend fun logout() {

        sessionManager.clearSession()
    }
}