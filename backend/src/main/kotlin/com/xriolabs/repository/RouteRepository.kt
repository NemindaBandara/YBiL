package com.xriolabs.YBiL.repository

import com.xriolabs.YBiL.entity.Route
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository
import java.util.UUID

@Repository
interface RouteRepository : JpaRepository<Route, UUID> {
    fun findByRouteNumber(routeNumber: String): List<Route>
}