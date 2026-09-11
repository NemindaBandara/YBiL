package com.example.ybil_mobile.security

data class UserSession(
    val accessToken: String? = null,
    val refreshToken: String? = null,
    val tokenType: String = "Bearer",
    val userId: String? = null,
    val username: String? = null,
    val role: String? = null
) {

    val isLoggedIn: Boolean
        get() = !accessToken.isNullOrBlank()
}