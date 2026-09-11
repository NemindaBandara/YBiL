package com.example.ybil_mobile.ui.auth

data class AuthUiState(
    val isLoggedIn: Boolean = false,
    val username: String? = null,
    val role: String? = null,
    val isLoading: Boolean = false,
    val errorMessage: String? = null
)