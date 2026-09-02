package com.xriolabs.YBiL.controller

import com.xriolabs.YBiL.dto.DeltaSyncResponse
import com.xriolabs.YBiL.dto.RouteResponse
import com.xriolabs.YBiL.service.TimetableService
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/public")
class PublicTimetableController(
    private val timetableService: TimetableService
) {

    @GetMapping("/routes")
    fun getRoutes(): ResponseEntity<List<RouteResponse>> {
        return ResponseEntity.ok(timetableService.getAllRoutes())
    }

    @GetMapping("/timetable/sync")
    fun syncTimetable(
        @RequestParam(name = "since", required = false) since: Long?
    ): ResponseEntity<DeltaSyncResponse> {
        val response = timetableService.getDeltaSync(since)
        return ResponseEntity.ok(response)
    }
}