package com.xriolabs.YBiL.dto

import com.xriolabs.YBiL.entity.enums.OperatorType
import com.fasterxml.jackson.annotation.JsonFormat
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.NotNull
import java.time.LocalTime
import java.util.UUID

data class CreateRouteRequest(
    @field:NotBlank(message = "Route number cannot be blank")
    val routeNumber: String,

    @field:NotBlank(message = "Origin cannot be blank")
    val origin: String,

    @field:NotBlank(message = "Destination cannot be blank")
    val destination: String
)

data class RouteResponse(
    val id: UUID,
    val routeNumber: String,
    val origin: String,
    val destination: String
)

data class CreateTimetableEntryRequest(
    @field:NotNull(message = "Route ID is required")
    val routeId: UUID,

    @field:NotNull(message = "Operator type must be SLTB or PRIVATE")
    val operatorType: OperatorType,

    val busNumber: String?,

    @field:NotNull(message = "Scheduled parking time is required")
    @field:JsonFormat(pattern = "HH:mm")
    val scheduledParkingTime: LocalTime,

    @field:NotNull(message = "Scheduled leaving time is required")
    @field:JsonFormat(pattern = "HH:mm")
    val scheduledLeavingTime: LocalTime
)

data class TimetableEntryResponse(
    val id: UUID,
    val route: RouteResponse,
    val operatorType: OperatorType,
    val busNumber: String?,
    @JsonFormat(pattern = "HH:mm")
    val scheduledParkingTime: LocalTime,
    @JsonFormat(pattern = "HH:mm")
    val scheduledLeavingTime: LocalTime,
    val updatedAt: Long // Epoch milliseconds for sync comparison
)