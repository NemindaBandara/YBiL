package com.example.ybil_mobile.ui.common

import android.Manifest
import android.app.AlarmManager
import android.content.Context
import android.content.Intent
import android.net.Uri
import android.os.Build
import android.provider.Settings
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.platform.LocalContext

@Composable
fun NotificationAndAlarmPermissionHandler(onPermissionsHandled: () -> Unit = {}) {
    val context = LocalContext.current
    var showAlarmExplanationDialog by rememberSaveable { mutableStateOf(false) }

    // Launcher for Notification Permission (Android 13+)
    val notificationPermissionLauncher =
            rememberLauncherForActivityResult(
                    contract = ActivityResultContracts.RequestPermission()
            ) { _ ->
                // After notification permission is granted/denied, check exact alarm access
                checkExactAlarmPermission(context) { needsExplanation ->
                    if (needsExplanation) {
                        showAlarmExplanationDialog = true
                    } else {
                        onPermissionsHandled()
                    }
                }
            }

    LaunchedEffect(Unit) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            notificationPermissionLauncher.launch(Manifest.permission.POST_NOTIFICATIONS)
        } else {
            checkExactAlarmPermission(context) { needsExplanation ->
                if (needsExplanation) {
                    showAlarmExplanationDialog = true
                } else {
                    onPermissionsHandled()
                }
            }
        }
    }

    if (showAlarmExplanationDialog) {
        AlertDialog(
                onDismissRequest = {
                    showAlarmExplanationDialog = false
                    onPermissionsHandled()
                },
                title = {
                    Text(
                            text = "Enable Precise Departure Alarms",
                            style = MaterialTheme.typography.titleMedium
                    )
                },
                text = {
                    Text(
                            text =
                                    "To guarantee you receive accurate, minute-by-minute boarding alerts (Bay Arrival, T-15, T-5, T-3, T-2, T-1) even when your phone is in sleep or battery-saving mode, YBiL needs permission to schedule exact alarms.\n\nTap 'Allow in Settings' to enable Exact Alarm access.",
                            style = MaterialTheme.typography.bodyMedium
                    )
                },
                confirmButton = {
                    Button(
                            onClick = {
                                showAlarmExplanationDialog = false
                                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
                                    try {
                                        val intent =
                                                Intent(Settings.ACTION_REQUEST_SCHEDULE_EXACT_ALARM)
                                                        .apply {
                                                            data =
                                                                    Uri.parse(
                                                                            "package:${context.packageName}"
                                                                    )
                                                            flags = Intent.FLAG_ACTIVITY_NEW_TASK
                                                        }
                                        context.startActivity(intent)
                                    } catch (e: Exception) {
                                        val intent =
                                                Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS)
                                                        .apply {
                                                            data =
                                                                    Uri.parse(
                                                                            "package:${context.packageName}"
                                                                    )
                                                            flags = Intent.FLAG_ACTIVITY_NEW_TASK
                                                        }
                                        context.startActivity(intent)
                                    }
                                }
                                onPermissionsHandled()
                            },
                            colors =
                                    ButtonDefaults.buttonColors(
                                            containerColor = MaterialTheme.colorScheme.primary
                                    )
                    ) { Text("Allow in Settings") }
                },
                dismissButton = {
                    TextButton(
                            onClick = {
                                showAlarmExplanationDialog = false
                                onPermissionsHandled()
                            }
                    ) { Text("Maybe Later") }
                }
        )
    }
}

private fun checkExactAlarmPermission(context: Context, onResult: (Boolean) -> Unit) {
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
        val alarmManager = context.getSystemService(Context.ALARM_SERVICE) as? AlarmManager
        val canSchedule = alarmManager?.canScheduleExactAlarms() ?: false
        onResult(!canSchedule)
    } else {
        onResult(false)
    }
}
