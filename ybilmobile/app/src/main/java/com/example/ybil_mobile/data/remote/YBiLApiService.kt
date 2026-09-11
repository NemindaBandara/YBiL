package com.example.ybil_mobile.data.remote

import com.example.ybil_mobile.data.remote.dto.TimetableSyncResponseDto
import retrofit2.http.GET
import retrofit2.http.Query
import com.example.ybil_mobile.data.remote.dto.AuthRequestDto
import com.example.ybil_mobile.data.remote.dto.AuthResponseDto
import com.example.ybil_mobile.data.remote.dto.AuthUserDto
import retrofit2.http.Body
import retrofit2.http.POST
import com.example.ybil_mobile.data.remote.dto.MarkTripRequestDto
import com.example.ybil_mobile.data.remote.dto.MarkedTripResponseDto
import retrofit2.http.DELETE
import retrofit2.http.Path

interface YBiLApiService {

    @GET("api/public/timetable/sync")
    suspend fun syncTimetable(
        @Query("since") since: Long
    ): TimetableSyncResponseDto

    @POST("api/auth/register")
    suspend fun register(
        @Body request: AuthRequestDto
    ): AuthResponseDto

    @POST("api/auth/login")
    suspend fun login(
        @Body request: AuthRequestDto
    ): AuthResponseDto

    @GET("api/auth/me")
    suspend fun getCurrentUser(): AuthUserDto

    @POST("api/trips/mark")
    suspend fun markTrip(
        @Body request: MarkTripRequestDto
    ): MarkedTripResponseDto

    @GET("api/trips/active")
    suspend fun getActiveTrips():
            List<MarkedTripResponseDto>

    @DELETE("api/trips/{tripId}")
    suspend fun cancelTrip(
        @Path("tripId") tripId: String
    )
}