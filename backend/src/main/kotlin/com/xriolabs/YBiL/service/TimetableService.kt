package com.xriolabs.YBiL.service

import com.xriolabs.YBiL.dto.*
import com.xriolabs.YBiL.entity.Route
import com.xriolabs.YBiL.entity.TimetableEntry
import com.xriolabs.YBiL.repository.RouteRepository
import com.xriolabs.YBiL.repository.TimetableEntryRepository
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.Instant
import java.util.UUID

@Service
class TimetableService(
    private val routeRepository: RouteRepository,
    private val timetableEntryRepository: TimetableEntryRepository
) {

    @Transactional
    fun createRoute(request: CreateRouteRequest): RouteResponse {
        val route = Route(
            routeNumber = request.routeNumber.trim(),
            origin = request.origin.trim(),
            destination = request.destination.trim()
        )
        val saved = routeRepository.save(route)
        return saved.toResponse()
    }

    @Transactional(readOnly = true)
    fun getAllRoutes(): List<RouteResponse> {
        return routeRepository.findAll().map { it.toResponse() }
    }

    @Transactional
    fun createTimetableEntry(request: CreateTimetableEntryRequest): TimetableEntryResponse {
        val route = routeRepository.findById(request.routeId).orElseThrow {
            IllegalArgumentException("Route not found with ID: ${request.routeId}")
        }

        val entry = TimetableEntry(
            route = route,
            operatorType = request.operatorType,
            busCategory = request.busCategory,
            busNumber = request.busNumber?.trim(),
            scheduledParkingTime = request.scheduledParkingTime,
            scheduledLeavingTime = request.scheduledLeavingTime,
            updatedAt = Instant.now()
        )

        val saved = timetableEntryRepository.save(entry)
        return saved.toResponse()
    }

    @Transactional(readOnly = true)
    fun getAllEntries(): List<TimetableEntryResponse> {
        return timetableEntryRepository.findAll().map { it.toResponse() }
    }

    // Extension functions for DTO mapping
    private fun Route.toResponse(): RouteResponse = RouteResponse(
        id = requireNotNull(this.id),
        routeNumber = this.routeNumber,
        origin = this.origin,
        destination = this.destination
    )

    private fun TimetableEntry.toResponse(): TimetableEntryResponse = TimetableEntryResponse(
        id = requireNotNull(this.id),
        route = this.route.toResponse(),
        operatorType = this.operatorType,
        busCategory = this.busCategory,
        busNumber = this.busNumber,
        scheduledParkingTime = this.scheduledParkingTime,
        scheduledLeavingTime = this.scheduledLeavingTime,
        updatedAt = this.updatedAt.toEpochMilli()
    )

    // Delta Sync
    @Transactional(readOnly = true)
    fun getDeltaSync(sinceEpochMilli: Long?): DeltaSyncResponse {
        val serverSyncCheckpoint = Instant.now()

        val entries = if (sinceEpochMilli == null || sinceEpochMilli <= 0) {
            // Full timetable snapshot
            timetableEntryRepository.findAll()
        } else {
            // Incremental sync: only rows modified after client's last sync checkpoint
            val sinceInstant = Instant.ofEpochMilli(sinceEpochMilli)
            timetableEntryRepository.findByUpdatedAtAfter(sinceInstant)
        }

        val mappedEntries = entries.map { it.toResponse() }

        return DeltaSyncResponse(
            syncedAt = serverSyncCheckpoint.toEpochMilli(),
            totalCount = mappedEntries.size,
            entries = mappedEntries
        )
    }
}