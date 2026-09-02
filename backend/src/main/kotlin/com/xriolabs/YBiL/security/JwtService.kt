package com.xriolabs.YBiL.security

import com.xriolabs.YBiL.entity.enums.Role
import io.jsonwebtoken.Claims
import io.jsonwebtoken.JwtException
import io.jsonwebtoken.Jwts
import io.jsonwebtoken.security.Keys
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Service
import java.util.Date
import java.util.UUID
import javax.crypto.SecretKey

@Service
class JwtService(
    @Value("\${jwt.secret}") private val secret: String,
    @Value("\${jwt.access-expiry-minutes:15}") private val accessExpiryMinutes: Long,
    @Value("\${jwt.refresh-expiry-days:30}") private val refreshExpiryDays: Long
) {

    private val signingKey: SecretKey by lazy {
        Keys.hmacShaKeyFor(secret.toByteArray())
    }

    fun generateAccessToken(userId: UUID, role: Role): String {
        val now = System.currentTimeMillis()
        return Jwts.builder()
            .subject(userId.toString())
            .claim("role", role.name)
            .issuedAt(Date(now))
            .expiration(Date(now + accessExpiryMinutes * 60 * 1000))
            .signWith(signingKey)
            .compact()
    }

    fun generateRefreshToken(userId: UUID): String {
        val now = System.currentTimeMillis()
        return Jwts.builder()
            .subject(userId.toString())
            .issuedAt(Date(now))
            .expiration(Date(now + refreshExpiryDays * 24 * 60 * 60 * 1000))
            .signWith(signingKey)
            .compact()
    }

    fun validateAndGetUserId(token: String): UUID? {
        return try {
            val claims = extractAllClaims(token)
            UUID.fromString(claims.subject)
        } catch (e: JwtException) {
            null
        } catch (e: IllegalArgumentException) {
            null
        }
    }

    fun extractRole(token: String): Role? {
        return try {
            val claims = extractAllClaims(token)
            val roleStr = claims["role"] as? String ?: return null
            Role.valueOf(roleStr)
        } catch (e: Exception) {
            null
        }
    }

    private fun extractAllClaims(token: String): Claims {
        return Jwts.parser()
            .verifyWith(signingKey)
            .build()
            .parseSignedClaims(token)
            .payload
    }
}