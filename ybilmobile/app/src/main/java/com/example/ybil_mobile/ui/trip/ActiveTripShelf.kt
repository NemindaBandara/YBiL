package com.example.ybil_mobile.ui.trip

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.expandVertically
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.animation.shrinkVertically
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowForward
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material.icons.filled.DirectionsBus
import androidx.compose.material.icons.filled.Warning
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.FilledTonalButton
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.ybil_mobile.ui.board.BusUiModel
import com.example.ybil_mobile.ui.board.DepartureStatus
import com.example.ybil_mobile.ui.board.calculateDepartureStatus
import com.example.ybil_mobile.ui.board.calculateMinutesUntilDeparture
import java.time.LocalTime

@Composable
fun ActiveTripShelf(
    trip: ActiveTripUiModel,
    missedFallback: MissedBusFallbackUiModel? = null,
    allBuses: List<BusUiModel> = emptyList(),
    currentTime: LocalTime = LocalTime.now(),
    onRequestUnmark: () -> Unit,
    onMissedClick: () -> Unit = {},
    onRequestSwitchTrip: (String) -> Unit = {},
    onDismissFallback: () -> Unit = {},
    modifier: Modifier = Modifier
) {
    val isSltb = trip.operatorType.equals("SLTB", ignoreCase = true)
    val departureStatus = calculateDepartureStatus(trip.leavingTime, currentTime)
    val minutesUntilDeparture = calculateMinutesUntilDeparture(trip.leavingTime, currentTime)
    val isDeparted = departureStatus == DepartureStatus.DEPARTED ||
            departureStatus == DepartureStatus.HIDDEN ||
            trip.status.equals("MISSED", ignoreCase = true)

    // Compute automatic next alternative buses on this route if bus has departed
    val resolvedAlternatives = remember(trip.routeNumber, trip.leavingTime, allBuses, missedFallback, isDeparted) {
        if (missedFallback != null && missedFallback.alternatives.isNotEmpty()) {
            missedFallback.alternatives
        } else if (isDeparted) {
            allBuses
                .filter {
                    it.routeNumber.equals(trip.routeNumber, ignoreCase = true) &&
                            it.leavingTime > trip.leavingTime
                }
                .sortedBy { it.leavingTime }
                .take(3)
        } else {
            emptyList()
        }
    }

    val showAlternativesDrawer = isDeparted || missedFallback != null

    Card(
        modifier = modifier.fillMaxWidth(),
        shape = RoundedCornerShape(20.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
        border = androidx.compose.foundation.BorderStroke(1.dp, MaterialTheme.colorScheme.primary.copy(alpha = 0.4f)),
        elevation = CardDefaults.cardElevation(defaultElevation = 4.dp)
    ) {
        Box(modifier = Modifier.fillMaxWidth()) {
            // Left Operator Accent Stripe
            Box(
                modifier = Modifier
                    .width(5.dp)
                    .matchParentSize()
                    .background(if (isSltb) Color(0xFFE94B50) else Color(0xFFEAD57B))
            )

            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(start = 14.dp, top = 14.dp, end = 14.dp, bottom = 14.dp),
                verticalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                // Top Row: Active Trip Pill + Unmark
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(6.dp)
                    ) {
                        Box(
                            modifier = Modifier
                                .size(8.dp)
                                .clip(CircleShape)
                                .background(MaterialTheme.colorScheme.primary)
                        )
                        Text(
                            text = "ACTIVE MARKED BUS",
                            color = MaterialTheme.colorScheme.primary,
                            fontSize = 11.sp,
                            fontWeight = FontWeight.Bold,
                            letterSpacing = 1.sp
                        )
                    }

                    Row(
                        horizontalArrangement = Arrangement.spacedBy(4.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        if (!isDeparted) {
                            TextButton(
                                onClick = onMissedClick,
                                colors = ButtonDefaults.textButtonColors(contentColor = Color(0xFFF59E0B)),
                                contentPadding = PaddingValues(horizontal = 8.dp, vertical = 2.dp)
                            ) {
                                Text(
                                    text = "Missed?",
                                    fontSize = 12.sp,
                                    fontWeight = FontWeight.SemiBold
                                )
                            }
                        }

                        TextButton(
                            onClick = onRequestUnmark,
                            colors = ButtonDefaults.textButtonColors(
                                contentColor = Color(0xFFEF4444)
                            ),
                            contentPadding = PaddingValues(horizontal = 8.dp, vertical = 2.dp)
                        ) {
                            Icon(
                                imageVector = Icons.Default.Delete,
                                contentDescription = "Unmark",
                                modifier = Modifier.size(14.dp)
                            )
                            Spacer(modifier = Modifier.width(4.dp))
                            Text(
                                text = "Unmark",
                                fontSize = 12.sp,
                                fontWeight = FontWeight.Bold
                            )
                        }
                    }
                }

                HorizontalDivider(color = MaterialTheme.colorScheme.outline.copy(alpha = 0.3f))

                // Middle Row: Badges, Route & Destination, Departure Time
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column(modifier = Modifier.weight(1f)) {
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(6.dp)
                        ) {
                            Box(
                                modifier = Modifier
                                    .clip(RoundedCornerShape(6.dp))
                                    .background(MaterialTheme.colorScheme.primaryContainer)
                                    .padding(horizontal = 7.dp, vertical = 2.dp)
                            ) {
                                Text(
                                    text = "Route ${trip.routeNumber}",
                                    color = MaterialTheme.colorScheme.onPrimaryContainer,
                                    fontSize = 11.sp,
                                    fontWeight = FontWeight.Bold
                                )
                            }

                            Box(
                                modifier = Modifier
                                    .clip(RoundedCornerShape(6.dp))
                                    .background(if (isSltb) Color(0xFFE94B50).copy(alpha = 0.15f) else Color(0xFFEAD57B).copy(alpha = 0.2f))
                                    .padding(horizontal = 6.dp, vertical = 2.dp)
                            ) {
                                Text(
                                    text = if (isSltb) "SLTB" else "PRIVATE",
                                    color = if (isSltb) Color(0xFFE94B50) else Color(0xFFD97706),
                                    fontSize = 10.sp,
                                    fontWeight = FontWeight.Bold
                                )
                            }

                            if (!trip.busNumber.isNullOrBlank()) {
                                Text(
                                    text = trip.busNumber,
                                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                                    fontSize = 11.sp,
                                    fontFamily = androidx.compose.ui.text.font.FontFamily.Monospace
                                )
                            }
                        }

                        Spacer(modifier = Modifier.height(4.dp))

                        Text(
                            text = trip.destination,
                            color = MaterialTheme.colorScheme.onSurface,
                            fontSize = 16.sp,
                            fontWeight = FontWeight.ExtraBold
                        )

                        Text(
                            text = "Bay Stands at ${trip.parkingTime}",
                            color = MaterialTheme.colorScheme.onSurfaceVariant,
                            fontSize = 12.sp,
                            fontWeight = FontWeight.Medium
                        )
                    }

                    Column(horizontalAlignment = Alignment.End) {
                        Text(
                            text = "DEPARTURE",
                            color = MaterialTheme.colorScheme.onSurfaceVariant,
                            fontSize = 9.sp,
                            fontWeight = FontWeight.Bold,
                            letterSpacing = 0.8.sp
                        )
                        Text(
                            text = trip.leavingTime,
                            color = MaterialTheme.colorScheme.primary,
                            fontSize = 22.sp,
                            fontWeight = FontWeight.Black
                        )

                        Spacer(modifier = Modifier.height(2.dp))

                        // Status Chip
                        ShelfStatusChip(
                            status = departureStatus,
                            minutesUntilDeparture = minutesUntilDeparture,
                            isDeparted = isDeparted
                        )
                    }
                }

                // Smart Alternatives section when bus departed or missed
                AnimatedVisibility(
                    visible = showAlternativesDrawer,
                    enter = fadeIn() + expandVertically(),
                    exit = fadeOut() + shrinkVertically()
                ) {
                    Column(
                        modifier = Modifier
                            .fillMaxWidth()
                            .clip(RoundedCornerShape(14.dp))
                            .background(MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.6f))
                            .border(1.dp, Color(0xFFF59E0B).copy(alpha = 0.5f), RoundedCornerShape(14.dp))
                            .padding(12.dp),
                        verticalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Row(
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.spacedBy(6.dp)
                            ) {
                                Icon(
                                    imageVector = Icons.Default.Warning,
                                    contentDescription = "Departed",
                                    tint = Color(0xFFF59E0B),
                                    modifier = Modifier.size(16.dp)
                                )
                                Text(
                                    text = "This bus has departed! Next options on Route ${trip.routeNumber}:",
                                    color = MaterialTheme.colorScheme.onSurface,
                                    fontSize = 12.sp,
                                    fontWeight = FontWeight.Bold
                                )
                            }

                            if (missedFallback != null) {
                                IconButton(
                                    onClick = onDismissFallback,
                                    modifier = Modifier.size(20.dp)
                                ) {
                                    Icon(
                                        imageVector = Icons.Default.Close,
                                        contentDescription = "Dismiss",
                                        tint = MaterialTheme.colorScheme.onSurfaceVariant,
                                        modifier = Modifier.size(14.dp)
                                    )
                                }
                            }
                        }

                        if (resolvedAlternatives.isEmpty()) {
                            Text(
                                text = "No later buses scheduled today on this corridor.",
                                color = MaterialTheme.colorScheme.onSurfaceVariant,
                                fontSize = 11.sp,
                                fontStyle = androidx.compose.ui.text.font.FontStyle.Italic
                            )
                        } else {
                            resolvedAlternatives.forEach { alt ->
                                AlternativeBusRow(
                                    bus = alt,
                                    onSwitch = { onRequestSwitchTrip(alt.id) }
                                )
                            }
                        }
                    }
                }
            }
        }
    }
}

@Composable
private fun ShelfStatusChip(
    status: DepartureStatus,
    minutesUntilDeparture: Long,
    isDeparted: Boolean
) {
    val (bgColor, textColor, label) = when {
        isDeparted -> Triple(Color(0xFFDC2626).copy(alpha = 0.15f), Color(0xFFEF4444), "DEPARTED")
        status == DepartureStatus.LEAVING_NOW -> Triple(Color(0xFFEA580C).copy(alpha = 0.2f), Color(0xFFF97316), "LEAVING NOW")
        status == DepartureStatus.URGENT -> Triple(Color(0xFFDC2626).copy(alpha = 0.15f), Color(0xFFEF4444), "IN $minutesUntilDeparture MIN")
        else -> Triple(MaterialTheme.colorScheme.primary.copy(alpha = 0.15f), MaterialTheme.colorScheme.primary, "IN $minutesUntilDeparture MIN")
    }

    Box(
        modifier = Modifier
            .clip(RoundedCornerShape(6.dp))
            .background(bgColor)
            .padding(horizontal = 8.dp, vertical = 2.dp)
    ) {
        Text(
            text = label,
            color = textColor,
            fontSize = 10.sp,
            fontWeight = FontWeight.Bold
        )
    }
}

@Composable
private fun AlternativeBusRow(
    bus: BusUiModel,
    onSwitch: () -> Unit
) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(8.dp))
            .background(MaterialTheme.colorScheme.surface)
            .padding(horizontal = 10.dp, vertical = 8.dp),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
    ) {
        Row(
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(6.dp)
        ) {
            Icon(
                imageVector = Icons.Default.DirectionsBus,
                contentDescription = null,
                tint = MaterialTheme.colorScheme.onSurfaceVariant,
                modifier = Modifier.size(15.dp)
            )
            Text(
                text = bus.leavingTime,
                color = MaterialTheme.colorScheme.onSurface,
                fontSize = 14.sp,
                fontWeight = FontWeight.Bold
            )
            Text(
                text = "(${bus.operatorType})",
                color = MaterialTheme.colorScheme.onSurfaceVariant,
                fontSize = 11.sp
            )
        }

        FilledTonalButton(
            onClick = onSwitch,
            colors = ButtonDefaults.filledTonalButtonColors(
                containerColor = MaterialTheme.colorScheme.primary,
                contentColor = MaterialTheme.colorScheme.onPrimary
            ),
            shape = RoundedCornerShape(8.dp),
            contentPadding = PaddingValues(horizontal = 10.dp, vertical = 4.dp),
            modifier = Modifier.height(28.dp)
        ) {
            Text(
                text = "Mark instead",
                fontSize = 10.sp,
                fontWeight = FontWeight.Bold
            )
            Spacer(modifier = Modifier.size(4.dp))
            Icon(
                imageVector = Icons.AutoMirrored.Filled.ArrowForward,
                contentDescription = null,
                modifier = Modifier.size(10.dp)
            )
        }
    }
}
