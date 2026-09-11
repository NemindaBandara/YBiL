package com.example.ybil_mobile.ui.auth

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material3.Button
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.ModalBottomSheet
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.unit.dp


private enum class AuthMode {
    LOGIN,
    REGISTER
}


@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AuthBottomSheet(
    uiState: AuthUiState,
    onLogin: (
        username: String,
        password: String
    ) -> Unit,
    onRegister: (
        username: String,
        password: String
    ) -> Unit,
    onLogout: () -> Unit,
    onClearError: () -> Unit,
    onDismiss: () -> Unit
) {

    ModalBottomSheet(
        onDismissRequest = {
            onClearError()
            onDismiss()
        }
    ) {

        if (uiState.isLoggedIn) {

            AccountContent(
                uiState = uiState,
                onLogout = onLogout,
                onDismiss = onDismiss
            )

        } else {

            AuthenticationContent(
                uiState = uiState,
                onLogin = onLogin,
                onRegister = onRegister,
                onClearError = onClearError
            )
        }
    }
}


@Composable
private fun AuthenticationContent(
    uiState: AuthUiState,
    onLogin: (
        username: String,
        password: String
    ) -> Unit,
    onRegister: (
        username: String,
        password: String
    ) -> Unit,
    onClearError: () -> Unit
) {

    var authMode by rememberSaveable {
        mutableStateOf(
            AuthMode.LOGIN
        )
    }

    var username by rememberSaveable {
        mutableStateOf("")
    }

    var password by rememberSaveable {
        mutableStateOf("")
    }

    Column(
        modifier = Modifier
            .fillMaxWidth()
            .padding(
                start = 24.dp,
                end = 24.dp,
                bottom = 32.dp
            ),
        verticalArrangement =
            Arrangement.spacedBy(12.dp)
    ) {

        Text(
            text =
                if (
                    authMode ==
                    AuthMode.LOGIN
                ) {
                    "Login to YBiL"
                } else {
                    "Create an account"
                },
            style =
                MaterialTheme.typography.headlineSmall
        )

        Text(
            text =
                if (
                    authMode ==
                    AuthMode.LOGIN
                ) {
                    "Login to mark a bus and track your active trip."
                } else {
                    "Create a passenger account to use trip tracking."
                },
            style =
                MaterialTheme.typography.bodyMedium
        )

        OutlinedTextField(
            value = username,
            onValueChange = {
                username = it
                onClearError()
            },
            label = {
                Text("Username")
            },
            singleLine = true,
            enabled =
                !uiState.isLoading,
            modifier =
                Modifier.fillMaxWidth()
        )

        OutlinedTextField(
            value = password,
            onValueChange = {
                password = it
                onClearError()
            },
            label = {
                Text("Password")
            },
            singleLine = true,
            enabled =
                !uiState.isLoading,
            visualTransformation =
                PasswordVisualTransformation(),
            keyboardOptions =
                KeyboardOptions(
                    keyboardType =
                        KeyboardType.Password
                ),
            modifier =
                Modifier.fillMaxWidth()
        )

        if (
            uiState.errorMessage != null
        ) {

            Text(
                text =
                    uiState.errorMessage,
                color =
                    MaterialTheme
                        .colorScheme
                        .error,
                style =
                    MaterialTheme
                        .typography
                        .bodyMedium
            )
        }

        Button(
            onClick = {

                if (
                    authMode ==
                    AuthMode.LOGIN
                ) {

                    onLogin(
                        username,
                        password
                    )

                } else {

                    onRegister(
                        username,
                        password
                    )
                }
            },
            enabled =
                !uiState.isLoading,
            modifier =
                Modifier.fillMaxWidth()
        ) {

            if (uiState.isLoading) {

                CircularProgressIndicator()

            } else {

                Text(
                    if (
                        authMode ==
                        AuthMode.LOGIN
                    ) {
                        "Login"
                    } else {
                        "Create Account"
                    }
                )
            }
        }

        HorizontalDivider()

        TextButton(
            onClick = {

                onClearError()

                authMode =
                    if (
                        authMode ==
                        AuthMode.LOGIN
                    ) {
                        AuthMode.REGISTER
                    } else {
                        AuthMode.LOGIN
                    }
            },
            enabled =
                !uiState.isLoading,
            modifier =
                Modifier.fillMaxWidth()
        ) {

            Text(
                if (
                    authMode ==
                    AuthMode.LOGIN
                ) {
                    "Don't have an account? Register"
                } else {
                    "Already have an account? Login"
                }
            )
        }
    }
}

@Composable
private fun AccountContent(
    uiState: AuthUiState,
    onLogout: () -> Unit,
    onDismiss: () -> Unit
) {

    Column(
        modifier = Modifier
            .fillMaxWidth()
            .padding(
                start = 24.dp,
                end = 24.dp,
                bottom = 32.dp
            ),
        verticalArrangement =
            Arrangement.spacedBy(12.dp)
    ) {

        Text(
            text = "Your Account",
            style =
                MaterialTheme
                    .typography
                    .headlineSmall
        )

        Text(
            text =
                uiState.username
                    ?: "Unknown user",
            style =
                MaterialTheme
                    .typography
                    .titleLarge
        )

        Text(
            text =
                displayRole(
                    uiState.role
                ),
            style =
                MaterialTheme
                    .typography
                    .bodyMedium
        )

        Spacer(
            modifier =
                Modifier.height(8.dp)
        )

        HorizontalDivider()

        Button(
            onClick = onDismiss,
            modifier =
                Modifier.fillMaxWidth()
        ) {
            Text("Done")
        }

        OutlinedButton(
            onClick = onLogout,
            modifier =
                Modifier.fillMaxWidth()
        ) {
            Text("Logout")
        }
    }
}


private fun displayRole(
    role: String?
): String {

    return when (role) {

        "ROLE_PASSENGER" ->
            "Passenger"

        "ROLE_ADMIN" ->
            "Administrator"

        null ->
            ""

        else ->
            role
    }
}