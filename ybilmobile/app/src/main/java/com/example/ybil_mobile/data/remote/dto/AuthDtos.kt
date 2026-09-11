package com.example.ybil_mobile.data.remote.dto

data class AuthRequestDto(
    val username: String,
    val password: String
)

data class AuthResponseDto(
    val accessToken: String,
    val refreshToken: String,
    val tokenType: String,
    val expiresIn: Long
)

data class AuthUserDto(
    val id: String,
    val username: String,
    val role: String
)