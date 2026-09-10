package com.example.ybil_mobile.data.local.dao

import androidx.room.Dao
import androidx.room.Query
import androidx.room.Upsert
import com.example.ybil_mobile.data.local.entity.SyncMetadataEntity

@Dao
interface SyncMetadataDao {

    @Query(
        """
        SELECT value
        FROM sync_metadata
        WHERE meta_key = :key
        LIMIT 1
        """
    )
    suspend fun getValue(
        key: String
    ): String?

    @Upsert
    suspend fun upsert(
        metadata: SyncMetadataEntity
    )
}