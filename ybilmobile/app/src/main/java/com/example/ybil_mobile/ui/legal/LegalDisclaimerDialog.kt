package com.example.ybil_mobile.ui.legal

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.heightIn
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Gavel
import androidx.compose.material.icons.filled.Security
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Checkbox
import androidx.compose.material3.CheckboxDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import androidx.compose.ui.window.DialogProperties

@Composable
fun LegalDisclaimerDialog(onAccept: () -> Unit, onViewFullPolicy: () -> Unit) {
    var isAgreed by remember { mutableStateOf(false) }

    Dialog(
            onDismissRequest = { /* Modal is mandatory on first launch */},
            properties =
                    DialogProperties(
                            dismissOnBackPress = false,
                            dismissOnClickOutside = false,
                            usePlatformDefaultWidth = false
                    )
    ) {
        Surface(
                modifier = Modifier.fillMaxWidth(0.92f).clip(RoundedCornerShape(24.dp)),
                color = Color(0xFF162026),
                tonalElevation = 8.dp
        ) {
            Column(
                    modifier = Modifier.padding(22.dp),
                    verticalArrangement = Arrangement.spacedBy(16.dp)
            ) {
                // Header with Shield Icon
                Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    Box(
                            modifier =
                                    Modifier.size(44.dp)
                                            .clip(RoundedCornerShape(12.dp))
                                            .background(Color(0xFF0284C7).copy(alpha = 0.15f)),
                            contentAlignment = Alignment.Center
                    ) {
                        Icon(
                                imageVector = Icons.Default.Security,
                                contentDescription = "Legal & Security",
                                tint = Color(0xFF38BDF8),
                                modifier = Modifier.size(24.dp)
                        )
                    }

                    Column {
                        Text(
                                text = "Terms & Transit Waiver",
                                color = Color.White,
                                fontSize = 18.sp,
                                fontWeight = FontWeight.Bold
                        )
                        Text(
                                text = "Please review before using YBiL",
                                color = Color(0xFF94A3B8),
                                fontSize = 12.sp
                        )
                    }
                }

                // Scrollable Legal Terms Card
                Box(
                        modifier =
                                Modifier.fillMaxWidth()
                                        .heightIn(max = 280.dp)
                                        .clip(RoundedCornerShape(14.dp))
                                        .background(Color(0xFF0F172A))
                                        .border(
                                                width = 1.dp,
                                                color = Color(0xFF334155).copy(alpha = 0.6f),
                                                shape = RoundedCornerShape(14.dp)
                                        )
                                        .padding(14.dp)
                                        .verticalScroll(rememberScrollState())
                ) {
                    Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
                        DisclaimerSection(
                                title = "1. Timetable Estimates & No Warranty",
                                body =
                                        "Departure and stand times presented by YBiL are estimated schedule predictions derived from transport operators (SLTB & Private) and terminal ground dispatchers. Real-world traffic congestion, bus rotation, breakdown, weather, or terminal operational changes may cause departures to occur earlier, later, or be canceled without advance notice. YBiL is provided 'AS-IS' with no warranty of timetable precision."
                        )

                        DisclaimerSection(
                                title = "2. Absolute Limitation of Liability",
                                body =
                                        "Under no circumstances shall YBiL, its authors, developers, or transit providers be liable for any direct, indirect, incidental, punitive, or consequential damages arising from the use of or inability to use this app. This includes, without limitation, missed departures, missed onward transit (flights, trains), financial losses, lost wages, or tickets. You use this service entirely at your own risk."
                        )

                        DisclaimerSection(
                                title = "3. Notification & Countdown Alarms",
                                body =
                                        "Milestone notifications (Parked, T-15, T-5, T-3, T-2, T-1, Leaving) are convenience aids. Device battery optimization, OS notification restrictions, background execution policies, or network disruption may delay or prevent alarms from triggering. Passengers remain solely responsible for being at their boarding stand on time."
                        )

                        DisclaimerSection(
                                title = "4. Privacy & Data Protection",
                                body =
                                        "YBiL strictly respects your privacy. We store only necessary authentication tokens and active trip states securely on your local device. We do not sell your personal data, track your physical GPS coordinates in the background, or profile your movement."
                        )
                    }
                }

                // Link to view full policy
                Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.Center
                ) {
                    TextButton(onClick = onViewFullPolicy) {
                        Icon(
                                imageVector = Icons.Default.Gavel,
                                contentDescription = null,
                                tint = Color(0xFF38BDF8),
                                modifier = Modifier.size(16.dp)
                        )
                        Spacer(modifier = Modifier.size(6.dp))
                        Text(
                                text = "Read Full Legal Terms & Privacy Policy",
                                color = Color(0xFF38BDF8),
                                fontSize = 12.sp,
                                fontWeight = FontWeight.SemiBold
                        )
                    }
                }

                // Checkbox Agreement
                Row(
                        verticalAlignment = Alignment.CenterVertically,
                        modifier = Modifier.fillMaxWidth()
                ) {
                    Checkbox(
                            checked = isAgreed,
                            onCheckedChange = { isAgreed = it },
                            colors =
                                    CheckboxDefaults.colors(
                                            checkedColor = Color(0xFF0284C7),
                                            checkmarkColor = Color.White,
                                            uncheckedColor = Color(0xFF64748B)
                                    )
                    )
                    Text(
                            text =
                                    "I have read, understood, and agree to the Terms of Service, Schedule Disclaimer, and Limitation of Liability.",
                            color = Color(0xFFCBD5E1),
                            fontSize = 12.sp,
                            lineHeight = 16.sp
                    )
                }

                // Accept Button
                Button(
                        onClick = onAccept,
                        enabled = isAgreed,
                        modifier = Modifier.fillMaxWidth().height(48.dp),
                        shape = RoundedCornerShape(12.dp),
                        colors =
                                ButtonDefaults.buttonColors(
                                        containerColor = Color(0xFF0284C7),
                                        contentColor = Color.White,
                                        disabledContainerColor = Color(0xFF1E293B),
                                        disabledContentColor = Color(0xFF64748B)
                                )
                ) {
                    Text(text = "Accept & Continue", fontSize = 14.sp, fontWeight = FontWeight.Bold)
                }
            }
        }
    }
}

@Composable
private fun DisclaimerSection(title: String, body: String) {
    Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
        Text(
                text = title,
                color = Color(0xFF38BDF8),
                fontSize = 12.sp,
                fontWeight = FontWeight.Bold
        )
        Text(text = body, color = Color(0xFF94A3B8), fontSize = 11.sp, lineHeight = 15.sp)
    }
}
