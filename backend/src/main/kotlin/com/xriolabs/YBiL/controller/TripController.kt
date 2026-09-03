package com.xriolabs.YBiL.controller

import com.xriolabs.YBiL.dto.*
import com.xriolabs.YBiL.entity.User
import com.xriolabs.YBiL.service.TripService
import jakarta.validation.Valid
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.web.bind.annotation.*
import java.util.UUID

@RestController
@RequestMapping("/api/trips")
class TripController(
    private val tripService: TripService
) {

    @PostMapping("/mark")
    fun markTrip(
        @AuthenticationPrincipal user: User,
        @Valid @RequestBody request: MarkTripRequest
    ): ResponseEntity<MarkedTripResponse> {
        val response = tripService.markTrip(user, request)
        return ResponseEntity.status(HttpStatus.CREATED).body(response)
    }

    @GetMapping("/active")
    fun getActiveTrips(@AuthenticationPrincipal user: User): ResponseEntity<List<MarkedTripResponse>> {
        return ResponseEntity.ok(tripService.getActiveTrips(user))
    }

    @DeleteMapping("/{tripId}")
    fun cancelTrip(
        @AuthenticationPrincipal user: User,
        @PathVariable tripId: UUID
    ): ResponseEntity<Void> {
        tripService.cancelMarkedTrip(user, tripId)
        return ResponseEntity.noContent().build()
    }

    @PostMapping("/{tripId}/missed")
    fun handleMissedTrip(
        @AuthenticationPrincipal user: User,
        @PathVariable tripId: UUID
    ): ResponseEntity<MissedBusFallbackResponse> {
        val response = tripService.handleMissedBus(user, tripId)
        return ResponseEntity.ok(response)
    }
}