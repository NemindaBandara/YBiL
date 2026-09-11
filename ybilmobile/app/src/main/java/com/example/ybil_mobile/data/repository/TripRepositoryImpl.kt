package com.example.ybil_mobile.data.repository

import com.example.ybil_mobile.data.remote.YBiLApiService
import com.example.ybil_mobile.data.remote.dto.MarkTripRequestDto
import com.example.ybil_mobile.data.remote.dto.MarkedTripResponseDto

class TripRepositoryImpl(
    private val authenticatedApi:
    YBiLApiService
) : TripRepository {

    override suspend fun getActiveTrip():
            MarkedTripResponseDto? {

        return authenticatedApi
            .getActiveTrips()
            .firstOrNull()
    }


    override suspend fun markTrip(
        timetableEntryId: String
    ): MarkedTripResponseDto {

        return authenticatedApi.markTrip(
            MarkTripRequestDto(
                timetableEntryId =
                    timetableEntryId
            )
        )
    }


    override suspend fun cancelTrip(
        tripId: String
    ) {

        authenticatedApi.cancelTrip(
            tripId = tripId
        )
    }
}