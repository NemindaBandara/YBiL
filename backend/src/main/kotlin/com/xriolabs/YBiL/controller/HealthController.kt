package com.xriolabs.YBiL.controller

import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import java.time.Instant

@RestController
@RequestMapping("/api/health")
class HealthController {

    @GetMapping
    fun healthCheck(): ResponseEntity<Map<String, Any>> {
        return ResponseEntity.ok(
                mapOf(
                        "status" to "UP",
                        "service" to "ybil-backend",
                        "timestamp" to Instant.now().toString()
                )
        )
    }
}