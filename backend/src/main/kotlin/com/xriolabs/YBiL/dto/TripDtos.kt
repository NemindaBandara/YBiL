package com.xriolabs.YBiL.dto

import com.xriolabs.YBiL.entity.enums.TripStatus
import jakarta.validation.constraints.NotNull
import java.time.Instant
import java.util.UUID

data class MarkTripRequest(
    @field:NotNull(message = "Timetable entry ID is required")
    val timetableEntryId: UUID
)

data class MarkedTripResponse(
    val id: UUID,
    val timetableEntry: TimetableEntryResponse,
    val status: TripStatus,
    val createdAt: Instant
)

data class MissedBusFallbackResponse(
    val missedTripId: UUID,
    val route: RouteResponse,
    val missedDepartureTime: String,
    val alternativeCount: Int,
    val nextAlternatives: List<TimetableEntryResponse>
)