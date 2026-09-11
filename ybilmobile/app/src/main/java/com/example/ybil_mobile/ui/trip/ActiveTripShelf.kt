package com.example.ybil_mobile.ui.trip

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp

@Composable
fun ActiveTripShelf(
    trip: ActiveTripUiModel,
    onUnmark: () -> Unit,
    modifier: Modifier = Modifier
) {

    Card(
        modifier =
            modifier.fillMaxWidth(),

        colors =
            CardDefaults.cardColors(
                containerColor =
                    MaterialTheme
                        .colorScheme
                        .primaryContainer
            )
    ) {

        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(12.dp),

            horizontalArrangement =
                Arrangement.SpaceBetween,

            verticalAlignment =
                Alignment.CenterVertically
        ) {

            Column(
                verticalArrangement =
                    Arrangement.spacedBy(2.dp)
            ) {

                Text(
                    text = "Active trip",
                    style =
                        MaterialTheme
                            .typography
                            .labelMedium
                )

                Text(
                    text =
                        "Route ${trip.routeNumber} · ${trip.destination}",
                    fontWeight =
                        FontWeight.Bold
                )

                Text(
                    text =
                        "Leaves ${trip.leavingTime}",
                    style =
                        MaterialTheme
                            .typography
                            .bodyMedium
                )
            }

            TextButton(
                onClick = onUnmark
            ) {

                Text("Unmark")
            }
        }
    }
}