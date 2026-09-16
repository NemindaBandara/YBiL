package com.example.ybil_mobile.ui.trip

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.DirectionsBus
import androidx.compose.material.icons.filled.NotificationsActive
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.ybil_mobile.ui.board.BusUiModel
import java.time.LocalTime
import java.time.temporal.ChronoUnit

@Composable
fun ActiveTripScreen(
    activeTripUiState: ActiveTripUiState,
    allBuses: List<BusUiModel> = emptyList(),
    onRequestUnmark: () -> Unit,
    onMissedClick: () -> Unit,
    onRequestSwitchTrip: (String) -> Unit,
    onDismissFallback: () -> Unit,
    onBrowseDepartures: () -> Unit,
    modifier: Modifier = Modifier
) {
    val trip = activeTripUiState.activeTrip

    Column(
        modifier = modifier
            .fillMaxSize()
            .background(MaterialTheme.colorScheme.background)
            .padding(16.dp)
            .verticalScroll(rememberScrollState()),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        // Top Header
        Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                Icon(
                    imageVector = Icons.Default.NotificationsActive,
                    contentDescription = null,
                    tint = MaterialTheme.colorScheme.primary,
                    modifier = Modifier.size(22.dp)
                )
                Text(
                    text = "Active Trip & Alarms",
                    color = MaterialTheme.colorScheme.onBackground,
                    fontSize = 22.sp,
                    fontWeight = FontWeight.ExtraBold
                )
            }
            Text(
                text = "Real-time departure tracking & boarding milestone alarms",
                color = MaterialTheme.colorScheme.onSurfaceVariant,
                fontSize = 12.sp
            )
        }

        if (trip != null) {
            // Render the full ActiveTripShelf with fallback actions
            ActiveTripShelf(
                trip = trip,
                missedFallback = activeTripUiState.missedFallback,
                allBuses = allBuses,
                onRequestUnmark = onRequestUnmark,
                onMissedClick = onMissedClick,
                onRequestSwitchTrip = onRequestSwitchTrip,
                onDismissFallback = onDismissFallback
            )

            // Current System Notification
            CurrentNotificationCard(trip = trip)
        } else {
            // Empty State
            Card(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(vertical = 24.dp),
                shape = RoundedCornerShape(20.dp),
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                border = androidx.compose.foundation.BorderStroke(
                    1.dp,
                    MaterialTheme.colorScheme.outlineVariant.copy(alpha = 0.5f)
                )
            ) {
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(24.dp),
                    horizontalAlignment = Alignment.CenterHorizontally,
                    verticalArrangement = Arrangement.spacedBy(14.dp)
                ) {
                    Box(
                        modifier = Modifier
                            .size(60.dp)
                            .clip(RoundedCornerShape(16.dp))
                            .background(
                                MaterialTheme.colorScheme.primary.copy(alpha = 0.15f)
                            ),
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(
                            imageVector = Icons.Default.DirectionsBus,
                            contentDescription = null,
                            tint = MaterialTheme.colorScheme.primary,
                            modifier = Modifier.size(32.dp)
                        )
                    }

                    Text(
                        text = "No Active Bus Tracked",
                        color = MaterialTheme.colorScheme.onSurface,
                        fontSize = 18.sp,
                        fontWeight = FontWeight.Bold
                    )

                    Text(
                        text = "Select a bus from the live departure board and tap 'Mark Bus' to activate minute-by-minute boarding notifications.",
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                        fontSize = 13.sp,
                        lineHeight = 18.sp,
                        textAlign = TextAlign.Center
                    )

                    Button(
                        onClick = onBrowseDepartures,
                        shape = RoundedCornerShape(10.dp),
                        colors = ButtonDefaults.buttonColors(
                            containerColor = MaterialTheme.colorScheme.primary
                        )
                    ) {
                        Text(
                            text = "Browse Live Departures",
                            fontSize = 13.sp,
                            fontWeight = FontWeight.Bold
                        )
                    }
                }
            }
        }

        Spacer(modifier = Modifier.height(16.dp))
    }
}

@Composable
private fun CurrentNotificationCard(
    trip: ActiveTripUiModel,
    currentTime: LocalTime = LocalTime.now()
) {
    val busLabel = trip.busNumber ?: "Bus ${trip.routeNumber}"
    val leavingTime = parseTimeOrNull(trip.leavingTime)
    val parkingTime = parseTimeOrNull(trip.parkingTime)
    val minutesLeft = if (leavingTime != null) {
        ChronoUnit.MINUTES.between(currentTime.truncatedTo(ChronoUnit.MINUTES), leavingTime)
    } else {
        0L
    }
    val isParked = if (parkingTime != null && leavingTime != null) {
        !currentTime.isBefore(parkingTime) && currentTime.isBefore(leavingTime)
    } else {
        false
    }
    val isMissed = trip.status.equals("MISSED", ignoreCase = true) || minutesLeft < -15L

    val (title, body, badgeLabel, badgeColor) = when {
        isMissed -> {
            Quadruple(
                "Trip Status: Bus Missed",
                "$busLabel scheduled departure (${trip.leavingTime}) has passed. Check alternative buses below.",
                "MISSED",
                Color(0xFFEF4444)
            )
        }
        minutesLeft <= 0 -> {
            Quadruple(
                "Bus Departing Now · Colombo Central",
                "$busLabel to ${trip.destination} is now departing Colombo Central.",
                "DEPARTED",
                Color(0xFFEF4444)
            )
        }
        minutesLeft <= 3 -> {
            Quadruple(
                "Final Call · $minutesLeft min left",
                "$busLabel leaves in $minutesLeft minutes! Head to the bus immediately.",
                "FINAL CALL",
                Color(0xFFF59E0B)
            )
        }
        minutesLeft <= 5 -> {
            Quadruple(
                "Boarding Alert · $minutesLeft min left",
                "$busLabel leaves in 5 minutes! Gate is preparing to close.",
                "BOARDING",
                Color(0xFFF59E0B)
            )
        }
        minutesLeft <= 15 -> {
            Quadruple(
                "Trip Reminder · $minutesLeft min left",
                "$busLabel to ${trip.destination} leaves in $minutesLeft minutes.",
                "T-15 MIN",
                MaterialTheme.colorScheme.primary
            )
        }
        isParked -> {
            Quadruple(
                "Bus Parked at Bay · Colombo Central",
                "$busLabel to ${trip.destination} is parked at bay and ready for boarding.",
                "PARKED",
                Color(0xFF25856F)
            )
        }
        else -> {
            Quadruple(
                "Bus Marked · Route ${trip.routeNumber}",
                "$busLabel to ${trip.destination} marked. We will notify you when it parks at ${trip.parkingTime}.",
                "MONITORING",
                Color(0xFF25856F)
            )
        }
    }

    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
        border = androidx.compose.foundation.BorderStroke(
            1.dp,
            badgeColor.copy(alpha = 0.35f)
        )
    ) {
        Column(
            modifier = Modifier.padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(10.dp)
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    Box(
                        modifier = Modifier
                            .size(28.dp)
                            .clip(RoundedCornerShape(8.dp))
                            .background(badgeColor.copy(alpha = 0.15f)),
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(
                            imageVector = Icons.Default.NotificationsActive,
                            contentDescription = null,
                            tint = badgeColor,
                            modifier = Modifier.size(16.dp)
                        )
                    }

                    Text(
                        text = "CURRENT SYSTEM NOTIFICATION",
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                        fontSize = 10.sp,
                        fontWeight = FontWeight.Bold,
                        letterSpacing = 0.8.sp
                    )
                }

                Box(
                    modifier = Modifier
                        .clip(RoundedCornerShape(6.dp))
                        .background(badgeColor.copy(alpha = 0.15f))
                        .padding(horizontal = 8.dp, vertical = 2.dp)
                ) {
                    Text(
                        text = badgeLabel,
                        color = badgeColor,
                        fontSize = 10.sp,
                        fontWeight = FontWeight.ExtraBold
                    )
                }
            }

            Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
                Text(
                    text = title,
                    color = MaterialTheme.colorScheme.onSurface,
                    fontSize = 14.sp,
                    fontWeight = FontWeight.Bold
                )
                Text(
                    text = body,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                    fontSize = 12.sp,
                    lineHeight = 16.sp
                )
            }
        }
    }
}

private fun parseTimeOrNull(timeStr: String): LocalTime? {
    return try {
        LocalTime.parse(timeStr)
    } catch (_: Exception) {
        null
    }
}

private data class Quadruple<A, B, C, D>(
    val first: A,
    val second: B,
    val third: C,
    val fourth: D
)