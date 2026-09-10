package com.example.ybil_mobile.data.local.entity

import androidx.room.Entity
import androidx.room.Index
import androidx.room.PrimaryKey

@Entity(
    tableName = "timetable_entries",
    indices = [
        Index("routeId"),
        Index("scheduledLeavingTime"),
        Index("updatedAt")
    ]
)
data class TimetableEntryEntity(

    @PrimaryKey
    val id: String,

    val routeId: String,

    val routeNumber: String,

    val origin: String,

    val destination: String,

    val operatorType: String,

    val busCategory: String,

    val busNumber: String?,

    val scheduledParkingTime: String,

    val scheduledLeavingTime: String,

    val updatedAt: Long
)