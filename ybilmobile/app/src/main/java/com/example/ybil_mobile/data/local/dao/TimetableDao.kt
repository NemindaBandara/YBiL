package com.example.ybil_mobile.data.local.dao

import androidx.room.Dao
import androidx.room.Query
import androidx.room.Upsert
import com.example.ybil_mobile.data.local.entity.TimetableEntryEntity
import kotlinx.coroutines.flow.Flow

@Dao
interface TimetableDao {

    @Query(
        """
        SELECT *
        FROM timetable_entries
        ORDER BY scheduledLeavingTime ASC
        """
    )
    fun observeAll(): Flow<List<TimetableEntryEntity>>

    @Upsert
    suspend fun upsertAll(
        entries: List<TimetableEntryEntity>
    )

    @Query(
        """
        DELETE FROM timetable_entries
        WHERE id IN (:ids)
        """
    )
    suspend fun deleteByIds(
        ids: List<String>
    )

    @Query("DELETE FROM timetable_entries")
    suspend fun clearAll()
}