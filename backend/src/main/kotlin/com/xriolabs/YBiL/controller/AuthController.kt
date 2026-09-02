package com.xriolabs.YBiL.controller

import com.xriolabs.YBiL.dto.*
import com.xriolabs.YBiL.entity.User
import com.xriolabs.YBiL.service.AuthService
import jakarta.validation.Valid
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/auth")
class AuthController(
    private val authService: AuthService
) {

    @PostMapping("/register")
    fun register(@Valid @RequestBody request: RegisterRequest): ResponseEntity<AuthResponse> {
        val response = authService.register(request)
        return ResponseEntity.status(HttpStatus.CREATED).body(response)
    }

    @PostMapping("/login")
    fun login(@Valid @RequestBody request: LoginRequest): ResponseEntity<AuthResponse> {
        val response = authService.login(request)
        return ResponseEntity.ok(response)
    }

    @PostMapping("/refresh")
    fun refresh(@Valid @RequestBody request: RefreshTokenRequest): ResponseEntity<AuthResponse> {
        val response = authService.refresh(request)
        return ResponseEntity.ok(response)
    }

    // Protected verification endpoint: tests that Bearer tokens work
    @GetMapping("/me")
    fun getCurrentUser(@AuthenticationPrincipal user: User): ResponseEntity<UserSummaryDto> {
        val summary = UserSummaryDto(
            id = user.id.toString(),
            username = user.username,
            role = user.role.name
        )
        return ResponseEntity.ok(summary)
    }
}