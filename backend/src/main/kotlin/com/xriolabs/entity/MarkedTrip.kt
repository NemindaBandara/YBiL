package com.xriolabs.YBiL.entity

import com.xriolabs.YBiL.entity.enums.TripStatus
import jakarta.persistence.*
import org.hibernate.annotations.CreationTimestamp
import java.time.Instant
import java.util.UUID

@Entity
@Table(
    name = "marked_trips",
    indexes = [
        Index(name = "idx_marked_trips_user_status", columnList = "user_id, status")
    ]
)
class MarkedTrip(
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    val id: UUID? = null,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    val user: User,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "timetable_entry_id", nullable = false)
    val timetableEntry: TimetableEntry,

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    var status: TripStatus = TripStatus.ACTIVE,

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    val createdAt: Instant = Instant.now()
)