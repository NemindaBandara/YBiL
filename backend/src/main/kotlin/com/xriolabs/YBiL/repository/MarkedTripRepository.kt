package com.xriolabs.YBiL.repository

import com.xriolabs.YBiL.entity.MarkedTrip
import com.xriolabs.YBiL.entity.enums.TripStatus
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository
import java.util.UUID

@Repository
interface MarkedTripRepository : JpaRepository<MarkedTrip, UUID> {
    // Finds active marked trips for a specific user
    fun findByUserIdAndStatus(userId: UUID, status: TripStatus): List<MarkedTrip>

    // Prevents duplicate active marks for the same user and timetable entry
    fun existsByUserIdAndTimetableEntryIdAndStatus(userId: UUID, timetableEntryId: UUID, status: TripStatus): Boolean

    fun findByUserIdAndTimetableEntryIdAndStatus(
        userId: UUID,
        timetableEntryId: UUID,
        status: TripStatus
    ): MarkedTrip?

    fun findAllByUserIdAndStatus(
        userId: UUID,
        status: TripStatus
    ): List<MarkedTrip>

    fun findByUserIdAndTimetableEntryId(
        userId: UUID,
        timetableEntryId: UUID
    ): MarkedTrip?
}