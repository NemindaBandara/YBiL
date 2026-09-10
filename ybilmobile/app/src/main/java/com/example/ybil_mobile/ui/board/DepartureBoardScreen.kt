package com.example.ybil_mobile.ui.board

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.compose.runtime.getValue

@Composable
fun DepartureBoardScreen(
    modifier: Modifier = Modifier,
    viewModel: DepartureBoardViewModel = viewModel()
) {

    val uiState by viewModel.uiState.collectAsStateWithLifecycle()

    DepartureBoardContent(
        modifier = modifier,
        uiState = uiState,
        onMarkBus = viewModel::toggleMarkedBus
    )
}

@Composable
fun DepartureBoardContent(
    uiState: DepartureBoardUiState,
    onMarkBus: (String) -> Unit,
    modifier: Modifier = Modifier
) {

    Column(
        modifier = modifier
            .fillMaxSize()
            .padding(16.dp)
    ) {

        Text(
            text = "YBiL",
            style = MaterialTheme.typography.headlineLarge,
            fontWeight = FontWeight.Bold
        )

        Text(
            text = "Departures from Colombo Central",
            style = MaterialTheme.typography.bodyLarge
        )

        Spacer(
            modifier = Modifier.height(16.dp)
        )

        if (uiState.isLoading) {

            Text(
                text = "Loading timetable..."
            )

            Spacer(
                modifier = Modifier.height(16.dp)
            )
        }

        if (uiState.errorMessage != null) {

            Text(
                text = "Unable to load timetable: ${uiState.errorMessage}"
            )

            Spacer(
                modifier = Modifier.height(16.dp)
            )
        }

        LazyColumn(
            verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {

            items(
                items = uiState.buses,
                key = { bus -> bus.id }
            ) { bus ->

                BusCard(
                    bus = bus,
                    isMarked = uiState.markedBusId == bus.id,
                    onMarkClick = {
                        onMarkBus(bus.id)
                    }
                )
            }
        }
    }
}

@Composable
fun BusCard(
    bus: BusUiModel,
    isMarked: Boolean,
    onMarkClick: () -> Unit
) {

    Card(
        modifier = Modifier.fillMaxWidth()
    ) {

        Column(
            modifier = Modifier.padding(16.dp)
        ) {

            Text(
                text = "Route ${bus.routeNumber}",
                style = MaterialTheme.typography.titleLarge,
                fontWeight = FontWeight.Bold
            )

            Text(
                text = bus.destination,
                style = MaterialTheme.typography.titleMedium
            )

            Spacer(
                modifier = Modifier.height(8.dp)
            )

            Text(
                text = bus.operatorType
            )

            Text(
                text = "Parks at ${bus.parkingTime}"
            )

            Text(
                text = "Leaves at ${bus.leavingTime}"
            )

            Spacer(
                modifier = Modifier.height(12.dp)
            )

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.End
            ) {

                Button(
                    onClick = onMarkClick
                ) {
                    Text(
                        text = if (isMarked) {
                            "Unmark"
                        } else {
                            "Mark"
                        }
                    )
                }
            }
        }
    }
}