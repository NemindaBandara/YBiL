package com.xriolabs.YBiL.dto

data class DeltaSyncResponse(
    val syncedAt: Long,
    val totalCount: Int,
    val entries: List<TimetableEntryResponse>
)