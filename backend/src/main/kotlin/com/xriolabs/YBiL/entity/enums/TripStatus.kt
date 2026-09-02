package com.xriolabs.YBiL.entity.enums

enum class TripStatus {
    ACTIVE,     // Trip marked, actively waiting for departure / alarms scheduled
    COMPLETED,  // Bus departed and passenger caught it
    MISSED,     // Departure time passed without departure confirmation
    CANCELLED   // Passenger unmarked the trip
}