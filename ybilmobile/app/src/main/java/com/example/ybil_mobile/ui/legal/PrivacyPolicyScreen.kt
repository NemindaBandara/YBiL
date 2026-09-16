package com.example.ybil_mobile.ui.legal

import androidx.compose.foundation.background
import androidx.compose.foundation.border
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
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.VerifiedUser
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

@Composable
fun PrivacyPolicyScreen(onBack: (() -> Unit)? = null, modifier: Modifier = Modifier) {
    Column(
            modifier =
                    modifier.fillMaxSize()
                            .background(Color(0xFF0F172A))
                            .padding(horizontal = 16.dp)
                            .verticalScroll(rememberScrollState()),
            verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        Spacer(modifier = Modifier.height(8.dp))

        // Top Header
        Row(modifier = Modifier.fillMaxWidth(), verticalAlignment = Alignment.CenterVertically) {
            if (onBack != null) {
                IconButton(onClick = onBack, modifier = Modifier.size(36.dp)) {
                    Icon(
                            imageVector = Icons.AutoMirrored.Filled.ArrowBack,
                            contentDescription = "Back",
                            tint = Color.White
                    )
                }
                Spacer(modifier = Modifier.size(8.dp))
            }

            Column {
                Text(
                        text = "Legal Terms & Privacy",
                        color = Color.White,
                        fontSize = 22.sp,
                        fontWeight = FontWeight.ExtraBold
                )
                Text(
                        text = "YBiL Passenger Transit Agreement",
                        color = Color(0xFF94A3B8),
                        fontSize = 12.sp
                )
            }
        }

        // Summary Shield Banner
        Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(containerColor = Color(0xFF162026))
        ) {
            Row(
                    modifier = Modifier.fillMaxWidth().padding(16.dp),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                Box(
                        modifier =
                                Modifier.size(40.dp)
                                        .clip(RoundedCornerShape(10.dp))
                                        .background(Color(0xFF0284C7).copy(alpha = 0.15f)),
                        contentAlignment = Alignment.Center
                ) {
                    Icon(
                            imageVector = Icons.Default.VerifiedUser,
                            contentDescription = null,
                            tint = Color(0xFF38BDF8),
                            modifier = Modifier.size(22.dp)
                    )
                }
                Column {
                    Text(
                            text = "Binding Legal Protection & Disclaimer",
                            color = Color.White,
                            fontSize = 13.sp,
                            fontWeight = FontWeight.Bold
                    )
                    Text(
                            text = "Effective Date: September 2026 • Version 1.0",
                            color = Color(0xFF64748B),
                            fontSize = 11.sp
                    )
                }
            }
        }

        // Section 1: Timetable Accuracy
        LegalCard(
                title = "1. Timetable Precision & Operating Conditions",
                content =
                        "YBiL provides passenger transit information aggregated from public schedules and ground terminal reports at Colombo Central Bus Station. All stand, parking, and leaving times are estimates subject to dynamic conditions including, without limitation:\n" +
                                "• Severe road traffic, vehicle break-downs, and infrastructure blockages.\n" +
                                "• Operator fleet alterations, driver shifts, and unscheduled service cancellations by SLTB or Private bus authorities.\n" +
                                "• Terminal platform overcrowding and gate reassignments.\n" +
                                "The service is provided strictly on an 'AS-IS' and 'AS-AVAILABLE' basis without warranty of any kind, whether express or implied."
        )

        // Section 2: Limitation of Liability
        LegalCard(
                title = "2. Absolute Limitation of Liability & Hold Harmless",
                content =
                        "To the maximum extent permitted by applicable law, neither YBiL, its creators, developers, contributors, nor affiliated transit operators shall be held liable for any damages of any nature arising from your use of, or inability to use, this application.\n\n" +
                                "Specifically, YBiL shall NOT be held responsible for:\n" +
                                "• Missed bus departures or transit connection failures (including connecting trains, domestic/international flights, or secondary bus routes).\n" +
                                "• Loss of employment, missed meetings, interviews, exam disqualifications, or business appointments.\n" +
                                "• Loss of wages, financial expenditures, accommodation fees, or forfeit of travel tickets.\n" +
                                "By using YBiL, you expressly agree to hold harmless and release YBiL and its developers from any and all legal claims, damages, demands, and liabilities."
        )

        // Section 3: Passenger Sole Responsibility
        LegalCard(
                title = "3. Passenger Duty of Care & Timely Boarding",
                content =
                        "Countdowns and notification alerts (Parked, T-15, T-5, T-3, T-2, T-1, Leaving) are advisory aids designed to assist passengers. It remains the passenger's sole responsibility to:\n" +
                                "• Arrive at the designated bay/stand at least 10 to 15 minutes prior to listed departure.\n" +
                                "• Verify the bus destination board and operator number physically before boarding.\n" +
                                "• Pay attention to terminal ground announcements and marshal instructions."
        )

        // Section 4: Notification and Device Constraints
        LegalCard(
                title = "4. Automated Alarms & System Constraints",
                content =
                        "Alarm delivery may be delayed, truncated, or suppressed by operating system power management (e.g. Android Doze mode, background battery optimization, manufacturer task killers), network latency, or device vibration settings. The absence of a push notification shall never constitute valid grounds for claiming compensation or attributing liability to YBiL."
        )

        // Section 5: Data Privacy & Security
        LegalCard(
                title = "5. Privacy Policy & Data Handling",
                content =
                        "YBiL is engineered with a privacy-first approach:\n\n" +
                                "• Data Collected: When you register or log in, we store your username and securely encrypted credentials solely to maintain your active trip state across sessions.\n" +
                                "• No Third-Party Tracking: We do not integrate advertising trackers, monetization brokers, or cross-app analytics SDKs.\n" +
                                "• Local Persistence: Active trip identifiers and timetable cache are held locally on your device in secure app storage (Room & DataStore).\n" +
                                "• Data Deletion: You may clear your session and local cache at any time via the Account tab."
        )

        // Section 6: Contact & Governing Jurisdiction
        LegalCard(
                title = "6. Governing Law & Contact",
                content =
                        "These terms shall be governed by and construed in accordance with the laws of Sri Lanka. Any disputes arising in connection with the application shall be subject to the exclusive jurisdiction of the competent courts of Colombo, Sri Lanka."
        )

        Spacer(modifier = Modifier.height(24.dp))
    }
}

@Composable
private fun LegalCard(title: String, content: String) {
    Card(
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(16.dp),
            colors = CardDefaults.cardColors(containerColor = Color(0xFF162026)),
            border =
                    androidx.compose.foundation.BorderStroke(
                            1.dp,
                            Color(0xFF334155).copy(alpha = 0.5f)
                    )
    ) {
        Column(
                modifier = Modifier.padding(16.dp),
                verticalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            Text(
                    text = title,
                    color = Color(0xFF38BDF8),
                    fontSize = 14.sp,
                    fontWeight = FontWeight.Bold
            )
            Text(text = content, color = Color(0xFFCBD5E1), fontSize = 12.sp, lineHeight = 18.sp)
        }
    }
}
