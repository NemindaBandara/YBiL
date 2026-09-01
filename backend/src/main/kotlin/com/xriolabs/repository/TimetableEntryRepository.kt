package com.xriolabs.YBiL.repository

import com.xriolabs.YBiL.entity.TimetableEntry
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import org.springframework.stereotype.Repository
import java.time.Instant
import java.time.LocalTime
import java.util.UUID

@Repository
interface TimetableEntryRepository : JpaRepository<TimetableEntry, UUID> {

    // Delta sync: retrieves only rows modified after the client's last sync checkpoint
    fun findByUpdatedAtAfter(since: Instant): List<TimetableEntry>

    // Missed bus fallback: returns the next scheduled departures on the same route
    @Query("""
        SELECT t FROM TimetableEntry t
        JOIN FETCH t.route r
        WHERE r.id = :routeId
          AND t.scheduledLeavingTime > :afterTime
        ORDER BY t.scheduledLeavingTime ASC
    """)
    fun findNextAlternatives(
        @Param("routeId") routeId: UUID,
        @Param("afterTime") afterTime: LocalTime
    ): List<TimetableEntry>
}