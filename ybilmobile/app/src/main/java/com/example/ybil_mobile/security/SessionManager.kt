package com.example.ybil_mobile.security

import android.content.Context
import androidx.datastore.core.DataStore
import androidx.datastore.preferences.core.Preferences
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.core.emptyPreferences
import androidx.datastore.preferences.core.stringPreferencesKey
import androidx.datastore.preferences.preferencesDataStore
import com.example.ybil_mobile.data.remote.dto.AuthResponseDto
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.catch
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.flow.map
import java.io.IOException


private val Context.sessionDataStore:
        DataStore<Preferences> by preferencesDataStore(
    name = "ybil_session"
)


class SessionManager(
    private val context: Context
) {

    private companion object {

        val ACCESS_TOKEN =
            stringPreferencesKey(
                "access_token"
            )

        val TOKEN_TYPE =
            stringPreferencesKey(
                "token_type"
            )

        val USER_ID =
            stringPreferencesKey(
                "user_id"
            )

        val USERNAME =
            stringPreferencesKey(
                "username"
            )

        val ROLE =
            stringPreferencesKey(
                "role"
            )
    }


    val sessionFlow: Flow<UserSession> =
        context.sessionDataStore
            .data
            .catch { exception ->

                if (exception is IOException) {
                    emit(
                        emptyPreferences()
                    )
                } else {
                    throw exception
                }
            }
            .map { preferences ->

                UserSession(
                    accessToken =
                        preferences[
                            ACCESS_TOKEN
                        ],

                    tokenType =
                        preferences[
                            TOKEN_TYPE
                        ] ?: "Bearer",

                    userId =
                        preferences[
                            USER_ID
                        ],

                    username =
                        preferences[
                            USERNAME
                        ],

                    role =
                        preferences[
                            ROLE
                        ]
                )
            }


    suspend fun saveSession(
        response: AuthResponseDto
    ) {

        context.sessionDataStore.edit {
                preferences ->

            preferences[ACCESS_TOKEN] =
                response.accessToken

            preferences[TOKEN_TYPE] =
                response.tokenType

            preferences[USER_ID] =
                response.user.id

            preferences[USERNAME] =
                response.user.username

            preferences[ROLE] =
                response.user.role
        }
    }


    suspend fun getAccessToken(): String? {

        return sessionFlow
            .first()
            .accessToken
    }


    suspend fun clearSession() {

        context.sessionDataStore.edit {
                preferences ->

            preferences.clear()
        }
    }
}