package com.xriolabs.YBiL.entity

import jakarta.persistence.*
import java.util.UUID

@Entity
@Table(
    name = "routes",
    indexes = [
        Index(name = "idx_routes_origin_destination", columnList = "origin, destination")
    ]
)
class Route(
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    val id: UUID? = null,

    @Column(name = "route_number", nullable = false, length = 20)
    var routeNumber: String,

    @Column(nullable = false, length = 100)
    var origin: String,

    @Column(nullable = false, length = 100)
    var destination: String
)