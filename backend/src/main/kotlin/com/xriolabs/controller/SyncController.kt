@RestController
@RequestMapping("/api/sync")
class SyncController(private val repo: TimetableEntryRepository) {

    @GetMapping("/timetable")
    fun syncTimetable(@RequestParam since: Long): SyncResponse {
        val sinceInstant = Instant.ofEpochMilli(since)
        val changed = repo.findByUpdatedAtAfter(sinceInstant)
        return SyncResponse(
                entries = changed.map { it.toDto() },
                serverTime = Instant.now().toEpochMilli()
        )
    }
}