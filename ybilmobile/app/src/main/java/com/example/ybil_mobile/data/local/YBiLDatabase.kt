package com.example.ybil_mobile.data.local

import android.content.Context
import androidx.room.Database
import androidx.room.Room
import androidx.room.RoomDatabase
import com.example.ybil_mobile.data.local.dao.RouteDao
import com.example.ybil_mobile.data.local.dao.SyncMetadataDao
import com.example.ybil_mobile.data.local.dao.TimetableDao
import com.example.ybil_mobile.data.local.entity.RouteEntity
import com.example.ybil_mobile.data.local.entity.SyncMetadataEntity
import com.example.ybil_mobile.data.local.entity.TimetableEntryEntity

@Database(
    entities = [
        RouteEntity::class,
        TimetableEntryEntity::class,
        SyncMetadataEntity::class
    ],
    version = 1,
    exportSchema = false
)
abstract class YBiLDatabase : RoomDatabase() {

    abstract fun routeDao(): RouteDao

    abstract fun timetableDao(): TimetableDao

    abstract fun syncMetadataDao(): SyncMetadataDao

    companion object {

        @Volatile
        private var INSTANCE: YBiLDatabase? = null

        fun getDatabase(
            context: Context
        ): YBiLDatabase {

            return INSTANCE ?: synchronized(this) {

                val instance =
                    Room.databaseBuilder(
                        context.applicationContext,
                        YBiLDatabase::class.java,
                        "ybil_database"
                    )
                        .build()

                INSTANCE = instance

                instance
            }
        }
    }
}