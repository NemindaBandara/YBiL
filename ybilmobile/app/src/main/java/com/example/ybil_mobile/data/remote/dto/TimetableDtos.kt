package com.example.ybil_mobile.data.remote.dto

data class TimetableSyncResponseDto(
    val syncedAt: Long,
    val totalCount: Int,
    val entries: List<TimetableEntryDto>,
    val deletedEntryIds: List<String>
)

data class TimetableEntryDto(
    val id: String,
    val route: RouteDto,
    val operatorType: String,
    val busCategory: String,
    val busNumber: String?,
    val scheduledParkingTime: String,
    val scheduledLeavingTime: String,
    val updatedAt: Long
)

data class RouteDto(
    val id: String,
    val routeNumber: String,
    val origin: String,
    val destination: String
)