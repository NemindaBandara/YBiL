package com.xriolabs.YBiL.entity

import com.xriolabs.YBiL.entity.enums.OperatorType
import jakarta.persistence.*
import org.hibernate.annotations.UpdateTimestamp
import java.time.Instant
import java.time.LocalTime
import java.util.UUID

@Entity
@Table(
    name = "timetable_entries",
    indexes = [
        Index(name = "idx_timetable_updated_at", columnList = "updated_at"),
        Index(name = "idx_timetable_route_id", columnList = "route_id")
    ]
)
class TimetableEntry(
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    val id: UUID? = null,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "route_id", nullable = false)
    var route: Route,

    @Enumerated(EnumType.STRING)
    @Column(name = "operator_type", nullable = false, length = 20)
    var operatorType: OperatorType,

    @Column(name = "bus_number", length = 30)
    var busNumber: String? = null,

    @Column(name = "scheduled_parking_time", nullable = false)
    var scheduledParkingTime: LocalTime,

    @Column(name = "scheduled_leaving_time", nullable = false)
    var scheduledLeavingTime: LocalTime,

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    var updatedAt: Instant = Instant.now(),

    @Version
    @Column(nullable = false)
    var version: Long = 0
)