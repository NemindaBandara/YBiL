package com.example.ybil_mobile.data.remote.dto

data class MarkTripRequestDto(
    val timetableEntryId: String
)

data class MarkedTripResponseDto(
    val id: String,
    val timetableEntry: TimetableEntryDto,
    val status: String,
    val createdAt: String
)