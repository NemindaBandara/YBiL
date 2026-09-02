package com.xriolabs.YBiL.repository

import com.xriolabs.YBiL.entity.User
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository
import java.util.UUID

@Repository
interface UserRepository : JpaRepository<User, UUID> {
    // Spring Data automatically converts this to: SELECT * FROM users WHERE username = ?
    fun findByUsername(username: String): User?

    // Generates an efficient COUNT or EXISTS query: SELECT count(id) > 0 FROM users WHERE username = ?
    fun existsByUsername(username: String): Boolean
}