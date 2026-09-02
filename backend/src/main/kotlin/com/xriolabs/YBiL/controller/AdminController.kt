package com.xriolabs.YBiL.controller

import com.xriolabs.YBiL.dto.*
import com.xriolabs.YBiL.service.TimetableService
import jakarta.validation.Valid
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
class AdminController(
    private val timetableService: TimetableService
) {

    @PostMapping("/routes")
    fun createRoute(@Valid @RequestBody request: CreateRouteRequest): ResponseEntity<RouteResponse> {
        val response = timetableService.createRoute(request)
        return ResponseEntity.status(HttpStatus.CREATED).body(response)
    }

    @GetMapping("/routes")
    fun getAllRoutes(): ResponseEntity<List<RouteResponse>> {
        return ResponseEntity.ok(timetableService.getAllRoutes())
    }

    @PostMapping("/timetable")
    fun createTimetableEntry(
        @Valid @RequestBody request: CreateTimetableEntryRequest
    ): ResponseEntity<TimetableEntryResponse> {
        val response = timetableService.createTimetableEntry(request)
        return ResponseEntity.status(HttpStatus.CREATED).body(response)
    }

    @GetMapping("/timetable")
    fun getAllEntries(): ResponseEntity<List<TimetableEntryResponse>> {
        return ResponseEntity.ok(timetableService.getAllEntries())
    }
}