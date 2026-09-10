package com.example.ybil_mobile.data.repository

import androidx.room.withTransaction
import com.example.ybil_mobile.data.local.YBiLDatabase
import com.example.ybil_mobile.data.local.entity.SyncMetadataEntity
import com.example.ybil_mobile.data.local.entity.TimetableEntryEntity
import com.example.ybil_mobile.data.mapper.toEntity
import com.example.ybil_mobile.data.remote.YBiLApiService
import kotlinx.coroutines.flow.Flow

class TimetableRepositoryImpl(
    private val apiService: YBiLApiService,
    private val database: YBiLDatabase
) : TimetableRepository {

    private val timetableDao = database.timetableDao()
    private val routeDao = database.routeDao()
    private val syncMetadataDao = database.syncMetadataDao()

    override fun observeTimetable():
            Flow<List<TimetableEntryEntity>> {

        return timetableDao.observeAll()
    }

    override suspend fun syncTimetable() {

        val lastSyncedAt =
            syncMetadataDao
                .getValue(LAST_SYNC_KEY)
                ?.toLongOrNull()
                ?: 0L

        val response =
            apiService.syncTimetable(
                since = lastSyncedAt
            )

        val deletedEntryIds =
            response.deletedEntryIds.orEmpty()

        database.withTransaction {

            val routes =
                response.entries
                    .map { entry ->
                        entry.route.toEntity()
                    }
                    .distinctBy { route ->
                        route.id
                    }

            val timetableEntries =
                response.entries.map { entry ->
                    entry.toEntity()
                }

            if (routes.isNotEmpty()) {
                routeDao.upsertAll(routes)
            }

            if (timetableEntries.isNotEmpty()) {
                timetableDao.upsertAll(
                    timetableEntries
                )
            }

            if (deletedEntryIds.isNotEmpty()) {
                timetableDao.deleteByIds(
                    deletedEntryIds
                )
            }

            syncMetadataDao.upsert(
                SyncMetadataEntity(
                    key = LAST_SYNC_KEY,
                    value = response.syncedAt.toString()
                )
            )
        }
    }

    companion object {
        private const val LAST_SYNC_KEY =
            "timetable_last_synced_at"
    }
}