package com.example.ybil_mobile.data.local.entity

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "routes")
data class RouteEntity(

    @PrimaryKey
    val id: String,

    val routeNumber: String,

    val origin: String,

    val destination: String
)