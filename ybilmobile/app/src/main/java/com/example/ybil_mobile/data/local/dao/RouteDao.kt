package com.example.ybil_mobile.data.local.dao

import androidx.room.Dao
import androidx.room.Query
import androidx.room.Upsert
import com.example.ybil_mobile.data.local.entity.RouteEntity
import kotlinx.coroutines.flow.Flow

@Dao
interface RouteDao {

    @Query(
        """
        SELECT *
        FROM routes
        ORDER BY routeNumber ASC
        """
    )
    fun observeAll(): Flow<List<RouteEntity>>

    @Upsert
    suspend fun upsertAll(
        routes: List<RouteEntity>
    )
}