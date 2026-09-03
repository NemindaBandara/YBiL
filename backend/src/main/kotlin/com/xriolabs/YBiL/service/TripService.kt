package com.xriolabs.YBiL.service

import com.xriolabs.YBiL.dto.*
import com.xriolabs.YBiL.entity.MarkedTrip
import com.xriolabs.YBiL.entity.User
import com.xriolabs.YBiL.entity.enums.TripStatus
import com.xriolabs.YBiL.repository.MarkedTripRepository
import com.xriolabs.YBiL.repository.TimetableEntryRepository
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.util.UUID

@Service
class TripService(
    private val markedTripRepository: MarkedTripRepository,
    private val timetableEntryRepository: TimetableEntryRepository,
    private val timetableService: TimetableService
) {

    @Transactional
    fun markTrip(user: User, request: MarkTripRequest): MarkedTripResponse {
        val entry = timetableEntryRepository.findById(request.timetableEntryId).orElseThrow {
            IllegalArgumentException("Timetable entry not found with ID: ${request.timetableEntryId}")
        }

        // Guard against duplicate active bookmarks
        val isAlreadyMarked = markedTripRepository.existsByUserIdAndTimetableEntryIdAndStatus(
            userId = requireNotNull(user.id),
            timetableEntryId = request.timetableEntryId,
            status = TripStatus.ACTIVE
        )

        if (isAlreadyMarked) {
            throw IllegalStateException("Trip is already marked and active")
        }

        val markedTrip = MarkedTrip(
            user = user,
            timetableEntry = entry,
            status = TripStatus.ACTIVE
        )

        val saved = markedTripRepository.save(markedTrip)
        return saved.toResponse()
    }

    @Transactional(readOnly = true)
    fun getActiveTrips(user: User): List<MarkedTripResponse> {
        return markedTripRepository.findByUserIdAndStatus(requireNotNull(user.id), TripStatus.ACTIVE)
            .map { it.toResponse() }
    }

    @Transactional
    fun cancelMarkedTrip(user: User, tripId: UUID) {
        val trip = markedTripRepository.findById(tripId).orElseThrow {
            IllegalArgumentException("Marked trip not found with ID: $tripId")
        }

        if (trip.user.id != user.id) {
            throw IllegalStateException("Cannot cancel another passenger's trip")
        }

        trip.status = TripStatus.CANCELLED
        markedTripRepository.save(trip)
    }

    @Transactional
    fun handleMissedBus(user: User, tripId: UUID): MissedBusFallbackResponse {
        val trip = markedTripRepository.findById(tripId).orElseThrow {
            IllegalArgumentException("Marked trip not found with ID: $tripId")
        }

        if (trip.user.id != user.id) {
            throw IllegalStateException("Cannot access another passenger's trip")
        }

        // Update status to MISSED
        trip.status = TripStatus.MISSED
        markedTripRepository.save(trip)

        val missedEntry = trip.timetableEntry
        val route = missedEntry.route

        // Fetch upcoming buses on the same route departing after this bus
        val alternatives = timetableEntryRepository.findNextAlternatives(
            routeId = requireNotNull(route.id),
            afterTime = missedEntry.scheduledLeavingTime
        )

        return MissedBusFallbackResponse(
            missedTripId = requireNotNull(trip.id),
            route = RouteResponse(
                id = requireNotNull(route.id),
                routeNumber = route.routeNumber,
                origin = route.origin,
                destination = route.destination
            ),
            missedDepartureTime = missedEntry.scheduledLeavingTime.toString(),
            alternativeCount = alternatives.size,
            nextAlternatives = alternatives.map { alt ->
                TimetableEntryResponse(
                    id = requireNotNull(alt.id),
                    route = RouteResponse(
                        id = requireNotNull(alt.route.id),
                        routeNumber = alt.route.routeNumber,
                        origin = alt.route.origin,
                        destination = alt.route.destination
                    ),
                    operatorType = alt.operatorType,
                    busNumber = alt.busNumber,
                    scheduledParkingTime = alt.scheduledParkingTime,
                    scheduledLeavingTime = alt.scheduledLeavingTime,
                    updatedAt = alt.updatedAt.toEpochMilli()
                )
            }
        )
    }

    private fun MarkedTrip.toResponse(): MarkedTripResponse = MarkedTripResponse(
        id = requireNotNull(this.id),
        timetableEntry = TimetableEntryResponse(
            id = requireNotNull(this.timetableEntry.id),
            route = RouteResponse(
                id = requireNotNull(this.timetableEntry.route.id),
                routeNumber = this.timetableEntry.route.routeNumber,
                origin = this.timetableEntry.route.origin,
                destination = this.timetableEntry.route.destination
            ),
            operatorType = this.timetableEntry.operatorType,
            busNumber = this.timetableEntry.busNumber,
            scheduledParkingTime = this.timetableEntry.scheduledParkingTime,
            scheduledLeavingTime = this.timetableEntry.scheduledLeavingTime,
            updatedAt = this.timetableEntry.updatedAt.toEpochMilli()
        ),
        status = this.status,
        createdAt = this.createdAt
    )
}