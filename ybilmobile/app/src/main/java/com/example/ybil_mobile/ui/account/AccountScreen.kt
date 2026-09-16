package com.example.ybil_mobile.ui.account

import android.widget.Toast
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
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
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowForwardIos
import androidx.compose.material.icons.automirrored.filled.ExitToApp
import androidx.compose.material.icons.filled.BrightnessAuto
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.filled.ContentCopy
import androidx.compose.material.icons.filled.DarkMode
import androidx.compose.material.icons.filled.Gavel
import androidx.compose.material.icons.filled.LightMode
import androidx.compose.material.icons.filled.Lock
import androidx.compose.material.icons.filled.NotificationsActive
import androidx.compose.material.icons.filled.Palette
import androidx.compose.material.icons.filled.Person
import androidx.compose.material.icons.filled.PrivacyTip
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.FilterChip
import androidx.compose.material3.FilterChipDefaults
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.platform.LocalClipboardManager
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.AnnotatedString
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.ybil_mobile.ui.auth.AuthUiState

@Composable
fun AccountScreen(
        authUiState: AuthUiState,
        themeMode: String,
        onThemeModeChange: (String) -> Unit,
        onOpenAuthSheet: () -> Unit,
        onRequestLogout: () -> Unit,
        onViewPrivacyPolicy: () -> Unit,
        onViewDisclaimer: () -> Unit,
        modifier: Modifier = Modifier
) {
    val context = LocalContext.current
    val clipboardManager = LocalClipboardManager.current
    var copiedId by remember { mutableStateOf(false) }

    val initial =
            if (authUiState.isLoggedIn && !authUiState.username.isNullOrBlank()) {
                authUiState.username.first().uppercase()
            } else {
                "G"
            }

    Column(
            modifier =
                    modifier.fillMaxSize()
                            .background(MaterialTheme.colorScheme.background)
                            .padding(horizontal = 16.dp)
                            .verticalScroll(rememberScrollState()),
            verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        Spacer(modifier = Modifier.height(4.dp))

        // Top Header
        Row(modifier = Modifier.fillMaxWidth(), verticalAlignment = Alignment.CenterVertically) {
            Text(
                    text = "My Account",
                    color = MaterialTheme.colorScheme.onBackground,
                    fontSize = 22.sp,
                    fontWeight = FontWeight.ExtraBold
            )
        }

        // User Profile Card
        Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(24.dp),
                colors =
                        CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                border =
                        androidx.compose.foundation.BorderStroke(
                                1.dp,
                                MaterialTheme.colorScheme.outline.copy(alpha = 0.5f)
                        )
        ) {
            Column(
                    modifier = Modifier.fillMaxWidth().padding(20.dp),
                    horizontalAlignment = Alignment.CenterHorizontally,
                    verticalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                // Avatar Circle
                Box(
                        modifier =
                                Modifier.size(68.dp)
                                        .clip(CircleShape)
                                        .background(MaterialTheme.colorScheme.primaryContainer),
                        contentAlignment = Alignment.Center
                ) {
                    if (authUiState.isLoggedIn) {
                        Text(
                                text = initial,
                                color = MaterialTheme.colorScheme.onPrimaryContainer,
                                fontSize = 28.sp,
                                fontWeight = FontWeight.Black
                        )
                    } else {
                        Icon(
                                imageVector = Icons.Default.Person,
                                contentDescription = null,
                                tint = MaterialTheme.colorScheme.onPrimaryContainer,
                                modifier = Modifier.size(34.dp)
                        )
                    }
                }

                // Name & Status
                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                    Text(
                            text =
                                    if (authUiState.isLoggedIn) authUiState.username ?: "Passenger"
                                    else "Guest Passenger",
                            color = MaterialTheme.colorScheme.onSurface,
                            fontSize = 18.sp,
                            fontWeight = FontWeight.Bold
                    )

                    Spacer(modifier = Modifier.height(4.dp))

                    Row(
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(6.dp)
                    ) {
                        Box(
                                modifier =
                                        Modifier.size(7.dp)
                                                .clip(CircleShape)
                                                .background(
                                                        if (authUiState.isLoggedIn)
                                                                Color(0xFF25856F)
                                                        else Color(0xFF94A3B8)
                                                )
                        )
                        Text(
                                text = if (authUiState.isLoggedIn) "PASSENGER" else "NOT LOGGED IN",
                                color =
                                        if (authUiState.isLoggedIn)
                                                MaterialTheme.colorScheme.primary
                                        else MaterialTheme.colorScheme.onSurfaceVariant,
                                fontSize = 11.sp,
                                fontWeight = FontWeight.Bold,
                                letterSpacing = 1.sp
                        )
                    }
                }

                if (authUiState.isLoggedIn && !authUiState.userId.isNullOrBlank()) {
                    Row(
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(6.dp),
                            modifier =
                                    Modifier.clip(RoundedCornerShape(8.dp))
                                            .background(
                                                    MaterialTheme.colorScheme.surfaceVariant.copy(
                                                            alpha = 0.5f
                                                    )
                                            )
                                            .padding(horizontal = 10.dp, vertical = 4.dp)
                    ) {
                        Text(
                                text = "ID: ${authUiState.userId.take(8)}...",
                                color = MaterialTheme.colorScheme.onSurfaceVariant,
                                fontSize = 11.sp,
                                fontFamily = androidx.compose.ui.text.font.FontFamily.Monospace
                        )
                        IconButton(
                                onClick = {
                                    authUiState.userId?.let {
                                        clipboardManager.setText(AnnotatedString(it))
                                        copiedId = true
                                        Toast.makeText(
                                                        context,
                                                        "User ID copied",
                                                        Toast.LENGTH_SHORT
                                                )
                                                .show()
                                    }
                                },
                                modifier = Modifier.size(18.dp)
                        ) {
                            Icon(
                                    imageVector =
                                            if (copiedId) Icons.Default.Check
                                            else Icons.Default.ContentCopy,
                                    contentDescription = "Copy ID",
                                    tint = MaterialTheme.colorScheme.onSurfaceVariant,
                                    modifier = Modifier.size(13.dp)
                            )
                        }
                    }
                }

                Spacer(modifier = Modifier.height(4.dp))

                // Auth Action Button
                if (authUiState.isLoggedIn) {
                    OutlinedButton(
                            onClick = onRequestLogout,
                            shape = RoundedCornerShape(12.dp),
                            colors =
                                    ButtonDefaults.outlinedButtonColors(
                                            contentColor = Color(0xFFEF4444)
                                    ),
                            border =
                                    androidx.compose.foundation.BorderStroke(
                                            1.dp,
                                            Color(0xFFEF4444).copy(alpha = 0.4f)
                                    ),
                            modifier = Modifier.fillMaxWidth()
                    ) {
                        Icon(
                                imageVector = Icons.AutoMirrored.Filled.ExitToApp,
                                contentDescription = null,
                                modifier = Modifier.size(16.dp)
                        )
                        Spacer(modifier = Modifier.width(8.dp))
                        Text(text = "Log Out", fontWeight = FontWeight.Bold, fontSize = 13.sp)
                    }
                } else {
                    Button(
                            onClick = onOpenAuthSheet,
                            shape = RoundedCornerShape(12.dp),
                            colors =
                                    ButtonDefaults.buttonColors(
                                            containerColor = MaterialTheme.colorScheme.primary
                                    ),
                            modifier = Modifier.fillMaxWidth()
                    ) {
                        Icon(
                                imageVector = Icons.Default.Lock,
                                contentDescription = null,
                                modifier = Modifier.size(16.dp)
                        )
                        Spacer(modifier = Modifier.width(8.dp))
                        Text(
                                text = "Sign In / Register",
                                fontWeight = FontWeight.Bold,
                                fontSize = 13.sp
                        )
                    }
                }
            }
        }

        // Section: Appearance / Theme Toggle
        Text(
                text = "APPEARANCE",
                color = MaterialTheme.colorScheme.onSurfaceVariant,
                fontSize = 11.sp,
                fontWeight = FontWeight.Bold,
                letterSpacing = 1.sp
        )

        Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(18.dp),
                colors =
                        CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                border =
                        androidx.compose.foundation.BorderStroke(
                                1.dp,
                                MaterialTheme.colorScheme.outline.copy(alpha = 0.5f)
                        )
        ) {
            Column(
                    modifier = Modifier.padding(16.dp),
                    verticalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    Icon(
                            imageVector = Icons.Default.Palette,
                            contentDescription = null,
                            tint = MaterialTheme.colorScheme.primary,
                            modifier = Modifier.size(20.dp)
                    )
                    Column {
                        Text(
                                text = "Theme Preference",
                                color = MaterialTheme.colorScheme.onSurface,
                                fontSize = 14.sp,
                                fontWeight = FontWeight.SemiBold
                        )
                        Text(
                                text = "Choose light, dark, or sync with your system",
                                color = MaterialTheme.colorScheme.onSurfaceVariant,
                                fontSize = 11.sp
                        )
                    }
                }

                Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    ThemeOptionChip(
                            label = "System",
                            icon = Icons.Default.BrightnessAuto,
                            isSelected = themeMode.equals("SYSTEM", ignoreCase = true),
                            onClick = { onThemeModeChange("SYSTEM") },
                            modifier = Modifier.weight(1f)
                    )
                    ThemeOptionChip(
                            label = "Light",
                            icon = Icons.Default.LightMode,
                            isSelected = themeMode.equals("LIGHT", ignoreCase = true),
                            onClick = { onThemeModeChange("LIGHT") },
                            modifier = Modifier.weight(1f)
                    )
                    ThemeOptionChip(
                            label = "Dark",
                            icon = Icons.Default.DarkMode,
                            isSelected = themeMode.equals("DARK", ignoreCase = true),
                            onClick = { onThemeModeChange("DARK") },
                            modifier = Modifier.weight(1f)
                    )
                }
            }
        }

        // Section: Legal & Policies
        Text(
                text = "LEGAL & POLICIES",
                color = MaterialTheme.colorScheme.onSurfaceVariant,
                fontSize = 11.sp,
                fontWeight = FontWeight.Bold,
                letterSpacing = 1.sp
        )

        Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(18.dp),
                colors =
                        CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                border =
                        androidx.compose.foundation.BorderStroke(
                                1.dp,
                                MaterialTheme.colorScheme.outline.copy(alpha = 0.5f)
                        )
        ) {
            Column {
                AccountMenuItem(
                        icon = Icons.Default.PrivacyTip,
                        title = "Privacy Policy & Passenger Rights",
                        subtitle = "Data handling, zero location profiling",
                        onClick = onViewPrivacyPolicy
                )

                HorizontalDivider(color = MaterialTheme.colorScheme.outline.copy(alpha = 0.3f))

                AccountMenuItem(
                        icon = Icons.Default.Gavel,
                        title = "Transit Liability Disclaimer",
                        subtitle = "Timetable AS-IS terms and passenger responsibilities",
                        onClick = onViewDisclaimer
                )

                HorizontalDivider(color = MaterialTheme.colorScheme.outline.copy(alpha = 0.3f))

                AccountMenuItem(
                        icon = Icons.Default.NotificationsActive,
                        title = "Notifications & Alarms Policy",
                        subtitle = "Doze-mode exact alarms and single-notification ID",
                        onClick = onViewDisclaimer
                )
            }
        }

        // App Version
        Column(
                modifier = Modifier.fillMaxWidth().padding(vertical = 12.dp),
                horizontalAlignment = Alignment.CenterHorizontally,
                verticalArrangement = Arrangement.spacedBy(4.dp)
        ) {
            Text(
                    text = "YBiL Mobile v1.0.0",
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                    fontSize = 12.sp,
                    fontWeight = FontWeight.Bold
            )
            Text(
                    text = "Colombo Central Transit Terminal • Real-Time Passenger System",
                    color = MaterialTheme.colorScheme.onSurfaceVariant.copy(alpha = 0.7f),
                    fontSize = 10.sp
            )
        }

        Spacer(modifier = Modifier.height(16.dp))
    }
}

@Composable
private fun ThemeOptionChip(
        label: String,
        icon: ImageVector,
        isSelected: Boolean,
        onClick: () -> Unit,
        modifier: Modifier = Modifier
) {
    FilterChip(
            selected = isSelected,
            onClick = onClick,
            label = {
                Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.Center,
                        modifier = Modifier.fillMaxWidth()
                ) {
                    Icon(
                            imageVector = icon,
                            contentDescription = null,
                            modifier = Modifier.size(14.dp)
                    )
                    Spacer(modifier = Modifier.width(4.dp))
                    Text(
                            text = label,
                            fontSize = 11.sp,
                            fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Medium
                    )
                }
            },
            shape = RoundedCornerShape(10.dp),
            colors =
                    FilterChipDefaults.filterChipColors(
                            selectedContainerColor = MaterialTheme.colorScheme.primary,
                            selectedLabelColor = MaterialTheme.colorScheme.onPrimary,
                            selectedLeadingIconColor = MaterialTheme.colorScheme.onPrimary,
                            containerColor =
                                    MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.4f),
                            labelColor = MaterialTheme.colorScheme.onSurface
                    ),
            modifier = modifier.height(36.dp)
    )
}

@Composable
private fun AccountMenuItem(
        icon: ImageVector,
        title: String,
        subtitle: String,
        onClick: () -> Unit
) {
    Row(
            modifier =
                    Modifier.fillMaxWidth()
                            .clickable(onClick = onClick)
                            .padding(horizontal = 16.dp, vertical = 14.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.SpaceBetween
    ) {
        Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(12.dp),
                modifier = Modifier.weight(1f)
        ) {
            Box(
                    modifier =
                            Modifier.size(34.dp)
                                    .clip(RoundedCornerShape(8.dp))
                                    .background(
                                            MaterialTheme.colorScheme.primary.copy(alpha = 0.1f)
                                    ),
                    contentAlignment = Alignment.Center
            ) {
                Icon(
                        imageVector = icon,
                        contentDescription = null,
                        tint = MaterialTheme.colorScheme.primary,
                        modifier = Modifier.size(18.dp)
                )
            }

            Column {
                Text(
                        text = title,
                        color = MaterialTheme.colorScheme.onSurface,
                        fontSize = 13.sp,
                        fontWeight = FontWeight.SemiBold
                )
                Text(
                        text = subtitle,
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                        fontSize = 11.sp
                )
            }
        }

        Icon(
                imageVector = Icons.AutoMirrored.Filled.ArrowForwardIos,
                contentDescription = null,
                tint = MaterialTheme.colorScheme.onSurfaceVariant.copy(alpha = 0.5f),
                modifier = Modifier.size(12.dp)
        )
    }
}
