package com.example.ybil_mobile.data.local.entity

import androidx.room.ColumnInfo
import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "sync_metadata")
data class SyncMetadataEntity(

    @PrimaryKey
    @ColumnInfo(name = "meta_key")
    val key: String,

    val value: String
)