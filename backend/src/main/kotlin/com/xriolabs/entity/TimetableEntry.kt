@Entity
@Table(name = "timetable_entries")
class TimetableEntry(
        @Id @GeneratedValue(strategy = GenerationType.UUID)
        val id: UUID? = null,

        @Column(name = "route_id", nullable = false)
        var routeId: UUID,

        @Column(name = "operator_type", nullable = false)
        var operatorType: String, // "SLTB" or "PRIVATE"

        @Column(name = "bus_number")
        var busNumber: String,

        @Column(name = "scheduled_parking_time")
        var scheduledParkingTime: LocalTime,

        @Column(name = "scheduled_leaving_time")
        var scheduledLeavingTime: LocalTime,

        @Column(name = "updated_at")
        var updatedAt: Instant = Instant.now(),

        @Version
        var version: Long = 0
)