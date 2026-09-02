package com.xriolabs.YBiL.service

import com.xriolabs.YBiL.dto.*
import com.xriolabs.YBiL.entity.User
import com.xriolabs.YBiL.entity.enums.Role
import com.xriolabs.YBiL.exception.InvalidCredentialsException
import com.xriolabs.YBiL.exception.InvalidTokenException
import com.xriolabs.YBiL.exception.UsernameAlreadyExistsException
import com.xriolabs.YBiL.repository.UserRepository
import com.xriolabs.YBiL.security.JwtService
import org.springframework.beans.factory.annotation.Value
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
class AuthService(
    private val userRepository: UserRepository,
    private val passwordEncoder: PasswordEncoder,
    private val jwtService: JwtService,
    @Value("\${jwt.access-expiry-minutes:15}") private val accessExpiryMinutes: Long
) {

    @Transactional
    fun register(request: RegisterRequest): AuthResponse {
        val normalizedUsername = request.username.trim().lowercase()

        // 1. Guard check for existing user
        if (userRepository.existsByUsername(normalizedUsername)) {
            throw UsernameAlreadyExistsException("Username '$normalizedUsername' is already taken")
        }

        // 2. Hash raw password with BCrypt before persisting
        val user = User(
            username = normalizedUsername,
            passwordHash = passwordEncoder.encode(request.password),
            role = Role.PASSENGER
        )
        val savedUser = userRepository.save(user)

        // 3. Issue token pair
        return generateAuthResponse(savedUser)
    }

    @Transactional(readOnly = true)
    fun login(request: LoginRequest): AuthResponse {
        val normalizedUsername = request.username.trim().lowercase()

        // 1. Look up user by username
        val user = userRepository.findByUsername(normalizedUsername)
            ?: throw InvalidCredentialsException("Invalid username or password")

        // 2. Compare hashed password with BCrypt
        if (!passwordEncoder.matches(request.password, user.passwordHash)) {
            throw InvalidCredentialsException("Invalid username or password")
        }

        // 3. Issue fresh tokens
        return generateAuthResponse(user)
    }

    @Transactional(readOnly = true)
    fun refresh(request: RefreshTokenRequest): AuthResponse {
        // 1. Extract subject (user ID) from refresh token
        val userId = jwtService.validateAndGetUserId(request.refreshToken)
            ?: throw InvalidTokenException("Invalid or expired refresh token")

        // 2. Verify user still exists in database
        val user = userRepository.findById(userId).orElseThrow {
            InvalidTokenException("User no longer exists")
        }

        // 3. Re-issue fresh access + refresh tokens
        return generateAuthResponse(user)
    }

    private fun generateAuthResponse(user: User): AuthResponse {
        val userId = requireNotNull(user.id) { "User ID cannot be null when generating tokens" }

        val accessToken = jwtService.generateAccessToken(userId, user.role)
        val refreshToken = jwtService.generateRefreshToken(userId)

        return AuthResponse(
            accessToken = accessToken,
            refreshToken = refreshToken,
            expiresIn = accessExpiryMinutes * 60 // converted to seconds
        )
    }
}