package com.example.ybil_mobile.data.remote

import com.example.ybil_mobile.data.remote.dto.TimetableSyncResponseDto
import retrofit2.http.GET
import retrofit2.http.Query

interface YBiLApiService {

    @GET("api/public/timetable/sync")
    suspend fun syncTimetable(
        @Query("since") since: Long
    ): TimetableSyncResponseDto
}