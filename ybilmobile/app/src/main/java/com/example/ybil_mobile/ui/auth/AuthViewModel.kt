package com.example.ybil_mobile.ui.auth

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.ybil_mobile.data.repository.AuthRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import retrofit2.HttpException
import java.io.IOException

class AuthViewModel(
    private val repository: AuthRepository
) : ViewModel() {

    private val _uiState =
        MutableStateFlow(
            AuthUiState()
        )

    val uiState: StateFlow<AuthUiState> =
        _uiState.asStateFlow()

    init {
        observeSession()
        validateStoredSession()
    }

    private fun observeSession() {

        viewModelScope.launch {

            repository.session.collect { session ->

                _uiState.update { currentState ->

                    currentState.copy(
                        isLoggedIn =
                            session.isLoggedIn,
                        username =
                            session.username,
                        role =
                            session.role
                    )
                }
            }
        }
    }


    private fun validateStoredSession() {

        viewModelScope.launch {

            val session =
                repository.session.first()

            if (!session.isLoggedIn) {
                return@launch
            }

            try {

                /*
                 * This calls /api/auth/me.
                 *
                 * The AuthInterceptor automatically adds
                 * the stored Bearer token.
                 */
                repository.getCurrentUser()

            } catch (exception: HttpException) {

                /*
                 * If the backend specifically says the
                 * token is unauthorized, remove the
                 * invalid local session.
                 */
                if (exception.code() == 401) {
                    repository.logout()
                }

            } catch (_: IOException) {

                /*
                 * Network unavailable.
                 *
                 * Do NOT automatically log the passenger
                 * out just because they are offline.
                 */
            }
        }
    }


    fun login(
        username: String,
        password: String
    ) {

        if (
            username.isBlank() ||
            password.isBlank()
        ) {

            _uiState.update {
                it.copy(
                    errorMessage =
                        "Username and password are required."
                )
            }

            return
        }

        viewModelScope.launch {

            _uiState.update {
                it.copy(
                    isLoading = true,
                    errorMessage = null
                )
            }

            try {

                repository.login(
                    username = username.trim(),
                    password = password
                )

                /*
                 * Immediately prove that the saved JWT
                 * can access a protected endpoint.
                 */

                _uiState.update {
                    it.copy(
                        isLoading = false,
                        errorMessage = null
                    )
                }

            } catch (exception: Exception) {

                _uiState.update {
                    it.copy(
                        isLoading = false,
                        errorMessage =
                            authErrorMessage(
                                exception = exception,
                                isRegister = false
                            )
                    )
                }
            }
        }
    }


    fun register(
        username: String,
        password: String
    ) {

        if (
            username.isBlank() ||
            password.isBlank()
        ) {

            _uiState.update {
                it.copy(
                    errorMessage =
                        "Username and password are required."
                )
            }

            return
        }

        viewModelScope.launch {

            _uiState.update {
                it.copy(
                    isLoading = true,
                    errorMessage = null
                )
            }

            try {

                repository.register(
                    username = username.trim(),
                    password = password
                )

                _uiState.update {
                    it.copy(
                        isLoading = false,
                        errorMessage = null
                    )
                }

            } catch (exception: Exception) {

                _uiState.update {
                    it.copy(
                        isLoading = false,
                        errorMessage =
                            authErrorMessage(
                                exception = exception,
                                isRegister = true
                            )
                    )
                }
            }
        }
    }


    fun logout() {

        viewModelScope.launch {

            repository.logout()

            _uiState.update {
                it.copy(
                    isLoading = false,
                    errorMessage = null
                )
            }
        }
    }


    fun clearError() {

        _uiState.update {
            it.copy(
                errorMessage = null
            )
        }
    }


    private fun authErrorMessage(
        exception: Exception,
        isRegister: Boolean
    ): String {

        return when (exception) {

            is HttpException -> {

                when (exception.code()) {

                    401 ->
                        "Invalid username or password."

                    409 ->
                        if (isRegister) {
                            "That username is already taken."
                        } else {
                            "Unable to log in."
                        }

                    else ->
                        "Server error (${exception.code()})."
                }
            }

            is IOException ->
                "Unable to connect to the server."

            else ->
                exception.message
                    ?: "Something went wrong."
        }
    }
}