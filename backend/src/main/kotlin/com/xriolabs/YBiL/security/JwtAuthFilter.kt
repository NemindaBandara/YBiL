package com.xriolabs.YBiL.security

import com.xriolabs.YBiL.repository.UserRepository
import jakarta.servlet.FilterChain
import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken
import org.springframework.security.core.authority.SimpleGrantedAuthority
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource
import org.springframework.stereotype.Component
import org.springframework.web.filter.OncePerRequestFilter

@Component
class JwtAuthFilter(
    private val jwtService: JwtService,
    private val userRepository: UserRepository
) : OncePerRequestFilter() {

    override fun doFilterInternal(
        request: HttpServletRequest,
        response: HttpServletResponse,
        filterChain: FilterChain
    ) {
        // Preflight OPTIONS requests must bypass JWT authentication entirely
        if ("OPTIONS".equals(request.method, ignoreCase = true)) {
            filterChain.doFilter(request, response)
            return
        }

        val authHeader = request.getHeader("Authorization")

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response)
            return
        }

        val jwt = authHeader.substring(7)
        val userId = jwtService.validateAndGetUserId(jwt)

        if (userId != null && SecurityContextHolder.getContext().authentication == null) {
            val user = userRepository.findById(userId).orElse(null)

            if (user != null) {
                val authorities = listOf(SimpleGrantedAuthority("ROLE_${user.role.name}"))
                val authToken = UsernamePasswordAuthenticationToken(
                    user,
                    null,
                    authorities
                )
                authToken.details = WebAuthenticationDetailsSource().buildDetails(request)
                SecurityContextHolder.getContext().authentication = authToken
            }
        }

        filterChain.doFilter(request, response)
    }
}