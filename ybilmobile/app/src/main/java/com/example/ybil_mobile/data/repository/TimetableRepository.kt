package com.example.ybil_mobile.data.repository

import com.example.ybil_mobile.data.local.entity.TimetableEntryEntity
import kotlinx.coroutines.flow.Flow

interface TimetableRepository {

    fun observeTimetable(): Flow<List<TimetableEntryEntity>>

    suspend fun syncTimetable()
}