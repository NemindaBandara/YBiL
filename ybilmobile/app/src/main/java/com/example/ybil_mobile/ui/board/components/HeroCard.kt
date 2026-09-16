package com.example.ybil_mobile.ui.board.components

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.DirectionsBus
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

@Composable
fun HeroCard(
        totalBusesToday: Int,
        nextDepartureTime: String?,
        totalActiveRoutes: Int,
        selectedOperator: String,
        modifier: Modifier = Modifier
) {
    Card(
            modifier = modifier.fillMaxWidth(),
            shape = RoundedCornerShape(24.dp),
            colors = CardDefaults.cardColors(containerColor = Color(0xFF1E262C)),
            elevation = CardDefaults.cardElevation(defaultElevation = 4.dp)
    ) {
        Box(
                modifier =
                        Modifier.fillMaxWidth()
                                .border(
                                        width = 1.dp,
                                        color = Color(0xFF334155).copy(alpha = 0.5f),
                                        shape = RoundedCornerShape(24.dp)
                                )
                                .background(
                                        brush =
                                                Brush.radialGradient(
                                                        colors =
                                                                listOf(
                                                                        Color(0xFF0284C7)
                                                                                .copy(
                                                                                        alpha =
                                                                                                0.08f
                                                                                ),
                                                                        Color.Transparent
                                                                ),
                                                        radius = 800f
                                                )
                                )
                                .padding(20.dp)
        ) {
            Column(verticalArrangement = Arrangement.spacedBy(16.dp)) {
                // Top Header Tag & Catchphrase
                Column(verticalArrangement = Arrangement.spacedBy(6.dp)) {
                    Text(
                            text = "LIVE DEPARTURE BOARD",
                            color = Color(0xFF6F8595),
                            fontSize = 11.sp,
                            fontWeight = FontWeight.Bold,
                            letterSpacing = 1.2.sp
                    )

                    Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                    ) {
                        Column {
                            Text(
                                    text = "Move smarter.",
                                    color = Color.White,
                                    fontSize = 22.sp,
                                    fontWeight = FontWeight.ExtraBold,
                                    lineHeight = 26.sp
                            )
                            Text(
                                    text = "Catch your bus.",
                                    color = Color(0xFF38BDF8),
                                    fontSize = 22.sp,
                                    fontWeight = FontWeight.ExtraBold,
                                    lineHeight = 26.sp
                            )
                        }

                        // Stylized Bus Graphic Container
                        Box(
                                modifier =
                                        Modifier.size(56.dp)
                                                .clip(RoundedCornerShape(16.dp))
                                                .background(
                                                        if (selectedOperator == "SLTB")
                                                                Color(0xFFE94B50)
                                                                        .copy(alpha = 0.15f)
                                                        else Color(0xFF38BDF8).copy(alpha = 0.15f)
                                                ),
                                contentAlignment = Alignment.Center
                        ) {
                            Icon(
                                    imageVector = Icons.Default.DirectionsBus,
                                    contentDescription = "Bus",
                                    tint =
                                            if (selectedOperator == "SLTB") Color(0xFFF87171)
                                            else Color(0xFF38BDF8),
                                    modifier = Modifier.size(32.dp)
                            )
                        }
                    }

                    Text(
                            text =
                                    "Real-time departures, bay stands & operator tiers at Colombo Central.",
                            color = Color(0xFF94A3B8),
                            fontSize = 12.sp,
                            lineHeight = 16.sp
                    )
                }

                // Stats Strip: Today, Next, Routes
                Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    StatTile(
                            value = "$totalBusesToday",
                            label = "today",
                            modifier = Modifier.weight(1f)
                    )

                    StatTile(
                            value = nextDepartureTime ?: "--:--",
                            label = "next",
                            modifier = Modifier.weight(1f)
                    )

                    StatTile(
                            value = "$totalActiveRoutes",
                            label = "routes",
                            modifier = Modifier.weight(1f)
                    )
                }
            }
        }
    }
}

@Composable
private fun StatTile(value: String, label: String, modifier: Modifier = Modifier) {
    Box(
            modifier =
                    modifier.clip(RoundedCornerShape(12.dp))
                            .background(Color(0xFF28323A).copy(alpha = 0.7f))
                            .border(
                                    width = 1.dp,
                                    color = Color.White.copy(alpha = 0.06f),
                                    shape = RoundedCornerShape(12.dp)
                            )
                            .padding(vertical = 8.dp, horizontal = 10.dp),
            contentAlignment = Alignment.Center
    ) {
        Column(
                horizontalAlignment = Alignment.CenterHorizontally,
                verticalArrangement = Arrangement.Center
        ) {
            Text(
                    text = value,
                    color = Color.White,
                    fontSize = 15.sp,
                    fontWeight = FontWeight.Bold,
                    maxLines = 1
            )
            Text(
                    text = label,
                    color = Color(0xFF94A3B8),
                    fontSize = 10.sp,
                    fontWeight = FontWeight.Medium
            )
        }
    }
}
