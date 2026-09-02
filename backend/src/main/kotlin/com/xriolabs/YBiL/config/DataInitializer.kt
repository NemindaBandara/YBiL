package com.xriolabs.YBiL.config

import com.xriolabs.YBiL.entity.User
import com.xriolabs.YBiL.entity.enums.Role
import com.xriolabs.YBiL.repository.UserRepository
import org.slf4j.LoggerFactory
import org.springframework.boot.CommandLineRunner
import org.springframework.context.annotation.Profile
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.stereotype.Component

@Component
@Profile("dev")
class DataInitializer(
    private val userRepository: UserRepository,
    private val passwordEncoder: PasswordEncoder
) : CommandLineRunner {

    private val logger = LoggerFactory.getLogger(DataInitializer::class.java)

    override fun run(vararg args: String?) {
        if (userRepository.findByUsername("admin") == null) {
            val admin = User(
                username = "admin",
                passwordHash = passwordEncoder.encode("admin123"),
                role = Role.ADMIN
            )
            userRepository.save(admin)
            logger.info("Initialized default dev admin user: 'admin' / 'admin123'")
        }
    }
}