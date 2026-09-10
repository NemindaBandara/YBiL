package com.example.ybil_mobile.data.mapper

import com.example.ybil_mobile.data.local.entity.RouteEntity
import com.example.ybil_mobile.data.local.entity.TimetableEntryEntity
import com.example.ybil_mobile.data.remote.dto.RouteDto
import com.example.ybil_mobile.data.remote.dto.TimetableEntryDto

fun RouteDto.toEntity(): RouteEntity {
    return RouteEntity(
        id = id,
        routeNumber = routeNumber,
        origin = origin,
        destination = destination
    )
}

fun TimetableEntryDto.toEntity(): TimetableEntryEntity {
    return TimetableEntryEntity(
        id = id,
        routeId = route.id,
        routeNumber = route.routeNumber,
        origin = route.origin,
        destination = route.destination,
        operatorType = operatorType,
        busCategory = busCategory,
        busNumber = busNumber,
        scheduledParkingTime = scheduledParkingTime,
        scheduledLeavingTime = scheduledLeavingTime,
        updatedAt = updatedAt
    )
}