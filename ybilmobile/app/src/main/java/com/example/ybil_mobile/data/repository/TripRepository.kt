package com.example.ybil_mobile.data.repository

import com.example.ybil_mobile.data.remote.dto.MarkedTripResponseDto
import com.example.ybil_mobile.data.remote.dto.MissedBusFallbackResponseDto

interface TripRepository {
    suspend fun getActiveTrip(): MarkedTripResponseDto?
    suspend fun markTrip(timetableEntryId: String): MarkedTripResponseDto
    suspend fun cancelTrip(tripId: String)
    suspend fun handleMissedTrip(tripId: String): MissedBusFallbackResponseDto
}
