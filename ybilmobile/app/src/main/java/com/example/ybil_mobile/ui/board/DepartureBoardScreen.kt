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
import androidx.compose.runtime.remember
import androidx.compose.ui.platform.LocalContext
import androidx.lifecycle.viewmodel.compose.viewModel
import com.example.ybil_mobile.YBiLApplication
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Text
import androidx.compose.ui.Alignment
import androidx.compose.ui.unit.dp
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import kotlinx.coroutines.delay
import java.time.LocalTime
import androidx.compose.material3.CardDefaults
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.FilterChip
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.rememberScrollState

@Composable
fun DepartureBoardScreen(
    modifier: Modifier = Modifier
) {

    val application =
        LocalContext.current.applicationContext
                as YBiLApplication

    val viewModelFactory =
        remember(application) {
            DepartureBoardViewModelFactory(
                repository =
                    application.timetableRepository
            )
        }

    val viewModel: DepartureBoardViewModel =
        viewModel(
            factory = viewModelFactory
        )

    val uiState by
    viewModel.uiState
        .collectAsStateWithLifecycle()

    DepartureBoardContent(
        modifier = modifier,
        uiState = uiState,
        onMarkBus =
            viewModel::toggleMarkedBus,
        onRefresh =
            viewModel::refreshTimetable
    )
}

@Composable
fun DepartureBoardContent(
    uiState: DepartureBoardUiState,
    onMarkBus: (String) -> Unit,
    onRefresh: () -> Unit,
    modifier: Modifier = Modifier
) {

    var currentTime by remember {
        mutableStateOf(LocalTime.now())
    }

    var searchQuery by rememberSaveable {
        mutableStateOf("")
    }

    var selectedOperator by rememberSaveable {
        mutableStateOf("ALL")
    }

    var selectedCategory by rememberSaveable {
        mutableStateOf("ALL")
    }

    LaunchedEffect(Unit) {

        while (true) {

            currentTime = LocalTime.now()

            delay(30_000)
        }
    }

    val visibleBuses =
        uiState.buses.filter { bus ->

            val departureStatus =
                calculateDepartureStatus(
                    leavingTime = bus.leavingTime,
                    currentTime = currentTime
                )

            val isVisible =
                departureStatus !=
                        DepartureStatus.HIDDEN

            val query =
                searchQuery.trim()

            val matchesSearch =
                query.isBlank() ||
                        bus.routeNumber.contains(
                            query,
                            ignoreCase = true
                        ) ||
                        bus.destination.contains(
                            query,
                            ignoreCase = true
                        ) ||
                        bus.busNumber
                            ?.contains(
                                query,
                                ignoreCase = true
                            ) == true

            val matchesOperator =
                selectedOperator == "ALL" ||
                        bus.operatorType == selectedOperator

            val matchesCategory =
                selectedCategory == "ALL" ||
                        bus.busCategory == selectedCategory

            isVisible &&
                    matchesSearch &&
                    matchesOperator &&
                    matchesCategory
        }


    //Decide why there are no visible buses.
    val emptyMessage =
        when {

            uiState.buses.isEmpty() ->
                "No timetable entries available."

            searchQuery.isNotBlank() ||
                    selectedOperator != "ALL" ||
                    selectedCategory != "ALL" ->
                "No buses match your search or filter."

            else ->
                "No upcoming buses right now."
        }

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

        //Sync status
        if (uiState.isLoading) {

            Text(
                text = "Syncing timetable..."
            )

            Spacer(
                modifier = Modifier.height(8.dp)
            )
        }

        //Network / synchronization error
        //If Room already contains buses, we still show them.
        if (uiState.errorMessage != null) {

            val message =
                if (uiState.buses.isNotEmpty()) {
                    "Offline — showing saved timetable"
                } else {
                    "Unable to load timetable"
                }

            Text(
                text = message,
                fontWeight = FontWeight.Bold
            )

            Text(
                text = uiState.errorMessage
            )

            Spacer(
                modifier = Modifier.height(8.dp)
            )

            Button(
                onClick = onRefresh
            ) {
                Text("Retry")
            }

            Spacer(
                modifier = Modifier.height(16.dp)
            )
        }

        //Search
        OutlinedTextField(
            value = searchQuery,
            onValueChange = { newValue ->
                searchQuery = newValue
            },
            label = {
                Text("Search buses")
            },
            placeholder = {
                Text(
                    "Route, destination or bus number"
                )
            },
            singleLine = true,
            modifier = Modifier.fillMaxWidth()
        )

        Spacer(
            modifier = Modifier.height(8.dp)
        )

      //Operator filters

        Row(
            horizontalArrangement =
                Arrangement.spacedBy(8.dp)
        ) {

            FilterChip(
                selected =
                    selectedOperator == "ALL",
                onClick = {
                    selectedOperator = "ALL"
                },
                label = {
                    Text("All")
                }
            )

            FilterChip(
                selected =
                    selectedOperator == "SLTB",
                onClick = {
                    selectedOperator = "SLTB"
                },
                label = {
                    Text("SLTB")
                }
            )

            FilterChip(
                selected =
                    selectedOperator == "PRIVATE",
                onClick = {
                    selectedOperator = "PRIVATE"
                },
                label = {
                    Text("Private")
                }
            )
        }

        Spacer(
            modifier = Modifier.height(12.dp)
        )

        Text(
            text = "Bus category",
            style = MaterialTheme.typography.labelLarge
        )

        Spacer(
            modifier = Modifier.height(4.dp)
        )

        //Bus Category filters

        Row(
            modifier = Modifier
                .fillMaxWidth()
                .horizontalScroll(
                    rememberScrollState()
                ),
            horizontalArrangement =
                Arrangement.spacedBy(8.dp)
        ) {

            FilterChip(
                selected =
                    selectedCategory == "ALL",
                onClick = {
                    selectedCategory = "ALL"
                },
                label = {
                    Text("All")
                }
            )

            FilterChip(
                selected =
                    selectedCategory == "NORMAL",
                onClick = {
                    selectedCategory = "NORMAL"
                },
                label = {
                    Text("Normal")
                }
            )

            FilterChip(
                selected =
                    selectedCategory == "SEMI",
                onClick = {
                    selectedCategory = "SEMI"
                },
                label = {
                    Text("Semi")
                }
            )

            FilterChip(
                selected =
                    selectedCategory == "LUXURY_AC",
                onClick = {
                    selectedCategory = "LUXURY_AC"
                },
                label = {
                    Text("Luxury AC")
                }
            )

            FilterChip(
                selected =
                    selectedCategory == "EXPRESSWAY",
                onClick = {
                    selectedCategory = "EXPRESSWAY"
                },
                label = {
                    Text("Expressway")
                }
            )
        }

        Spacer(
            modifier = Modifier.height(12.dp)
        )

        // Empty state or departure list
        if (
            visibleBuses.isEmpty() &&
            !uiState.isLoading
        ) {

            Text(
                text = emptyMessage,
                style = MaterialTheme.typography.bodyLarge,
                modifier = Modifier.padding(
                    vertical = 24.dp
                )
            )

        } else {

            LazyColumn(
                modifier = Modifier
                    .fillMaxWidth()
                    .weight(1f),
                verticalArrangement =
                    Arrangement.spacedBy(12.dp)
            ) {

                items(
                    items = visibleBuses,
                    key = { bus ->
                        bus.id
                    }
                ) { bus ->

                    BusCard(
                        bus = bus,
                        currentTime = currentTime,
                        isMarked =
                            uiState.markedBusId ==
                                    bus.id,
                        onMarkClick = {
                            onMarkBus(bus.id)
                        }
                    )
                }
            }
        }
    }
}


@Composable
private fun BusCard(
    bus: BusUiModel,
    currentTime: LocalTime,
    isMarked: Boolean,
    onMarkClick: () -> Unit,
    modifier: Modifier = Modifier
) {

    val departureStatus =
        calculateDepartureStatus(
            leavingTime = bus.leavingTime,
            currentTime = currentTime
        )

    val minutesUntilDeparture =
        calculateMinutesUntilDeparture(
            leavingTime = bus.leavingTime,
            currentTime = currentTime
        )

    val countdownText =
        displayDepartureCountdown(
            status = departureStatus,
            minutesUntilDeparture = minutesUntilDeparture
        )

    val containerColor =
        when (departureStatus) {

            DepartureStatus.UPCOMING ->
                MaterialTheme.colorScheme.surface

            DepartureStatus.URGENT ->
                MaterialTheme.colorScheme.errorContainer

            DepartureStatus.LEAVING_NOW ->
                MaterialTheme.colorScheme.tertiaryContainer

            DepartureStatus.DEPARTED ->
                MaterialTheme.colorScheme.surfaceVariant

            DepartureStatus.HIDDEN ->
                MaterialTheme.colorScheme.surfaceVariant
        }

    val contentColor =
        when (departureStatus) {

            DepartureStatus.UPCOMING ->
                MaterialTheme.colorScheme.onSurface

            DepartureStatus.URGENT ->
                MaterialTheme.colorScheme.onErrorContainer

            DepartureStatus.LEAVING_NOW ->
                MaterialTheme.colorScheme.onTertiaryContainer

            DepartureStatus.DEPARTED ->
                MaterialTheme.colorScheme.onSurfaceVariant

            DepartureStatus.HIDDEN ->
                MaterialTheme.colorScheme.onSurfaceVariant
        }

    Card(
        modifier = modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(
            containerColor = containerColor,
            contentColor = contentColor
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

                Text(
                    text = "Route ${bus.routeNumber}",
                    style = MaterialTheme.typography.titleLarge
                )

                Text(
                    text = displayOperator(bus.operatorType),
                    style = MaterialTheme.typography.labelLarge
                )
            }

            Text(
                text = bus.destination,
                style = MaterialTheme.typography.titleMedium
            )

            Text(
                text = displayBusDetails(bus),
                style = MaterialTheme.typography.bodyMedium
            )

            HorizontalDivider()

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween
            ) {

                Column {
                    Text(
                        text = "Parking",
                        style = MaterialTheme.typography.labelMedium
                    )

                    Text(
                        text = bus.parkingTime,
                        style = MaterialTheme.typography.titleMedium
                    )
                }

                Column(
                    horizontalAlignment = Alignment.End
                ) {

                    Text(
                        text = "Leaving",
                        style = MaterialTheme.typography.labelMedium
                    )

                    Text(
                        text = bus.leavingTime,
                        style = MaterialTheme.typography.titleMedium
                    )

                    Text(
                        text = countdownText,
                        style = MaterialTheme.typography.labelMedium,
                        fontWeight =
                            if (
                                departureStatus == DepartureStatus.URGENT ||
                                departureStatus == DepartureStatus.LEAVING_NOW
                            ) {
                                FontWeight.Bold
                            } else {
                                FontWeight.Normal
                            }
                    )
                }
            }

            Button(
                onClick = onMarkClick,
                modifier = Modifier.fillMaxWidth()
            ) {

                Text(
                    text =
                        if (isMarked) {
                            "Unmark Bus"
                        } else {
                            "Mark This Bus"
                        }
                )
            }
        }
    }
}

private fun displayOperator(
    operatorType: String
): String {

    return when (operatorType) {
        "SLTB" -> "SLTB"
        "PRIVATE" -> "Private"
        else -> operatorType
    }
}

private fun displayCategory(
    busCategory: String
): String {

    return when (busCategory) {
        "NORMAL" -> "Normal"
        "SEMI" -> "Semi"
        "LUXURY_AC" -> "Luxury AC"
        "EXPRESSWAY" -> "Expressway"
        else -> busCategory
    }
}

private fun displayBusDetails(
    bus: BusUiModel
): String {

    val category =
        displayCategory(bus.busCategory)

    val busNumber =
        bus.busNumber
            ?.takeIf { it.isNotBlank() }
            ?: "Not assigned"

    return "$category • Bus $busNumber"
}

private fun displayDepartureStatus(
    status: DepartureStatus
): String {

    return when (status) {

        DepartureStatus.UPCOMING ->
            "Upcoming"

        DepartureStatus.URGENT ->
            "Leaving soon"

        DepartureStatus.LEAVING_NOW ->
            "Leaving now"

        DepartureStatus.DEPARTED ->
            "Departed"

        DepartureStatus.HIDDEN ->
            "Past"
    }
}

private fun displayDepartureCountdown(
    status: DepartureStatus,
    minutesUntilDeparture: Long
): String {

    return when (status) {

        DepartureStatus.UPCOMING ->
            "$minutesUntilDeparture min"

        DepartureStatus.URGENT ->
            "Leaving in $minutesUntilDeparture min"

        DepartureStatus.LEAVING_NOW ->
            "Leaving now"

        DepartureStatus.DEPARTED ->
            "Departed ${-minutesUntilDeparture} min ago"

        DepartureStatus.HIDDEN ->
            "Past"
    }
}