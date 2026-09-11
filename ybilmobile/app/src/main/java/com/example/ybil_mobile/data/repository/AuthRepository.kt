package com.example.ybil_mobile.data.repository

import com.example.ybil_mobile.data.remote.dto.AuthUserDto
import com.example.ybil_mobile.security.UserSession
import kotlinx.coroutines.flow.Flow


interface AuthRepository {

    val session: Flow<UserSession>


    suspend fun login(
        username: String,
        password: String
    ): AuthUserDto


    suspend fun register(
        username: String,
        password: String
    ): AuthUserDto


    suspend fun getCurrentUser():
            AuthUserDto


    suspend fun logout()
}