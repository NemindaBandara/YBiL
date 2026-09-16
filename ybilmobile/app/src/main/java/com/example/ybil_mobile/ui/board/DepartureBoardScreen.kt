package com.example.ybil_mobile.ui.board

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.expandVertically
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.animation.shrinkVertically
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.horizontalScroll
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
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.lazy.rememberLazyListState
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.BrightnessAuto
import androidx.compose.material.icons.filled.DarkMode
import androidx.compose.material.icons.filled.DirectionsBus
import androidx.compose.material.icons.filled.KeyboardArrowUp
import androidx.compose.material.icons.filled.LightMode
import androidx.compose.material.icons.filled.Person
import androidx.compose.material.icons.filled.Refresh
import androidx.compose.material.icons.filled.Search
import androidx.compose.material.icons.filled.Visibility
import androidx.compose.material.icons.filled.VisibilityOff
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
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.derivedStateOf
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.luminance
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.lifecycle.viewmodel.compose.viewModel
import kotlinx.coroutines.launch
import com.example.ybil_mobile.YBiLApplication
import com.example.ybil_mobile.ui.auth.AuthUiState
import com.example.ybil_mobile.ui.auth.AuthViewModel
import com.example.ybil_mobile.ui.auth.AuthViewModelFactory
import com.example.ybil_mobile.ui.board.components.HeroCard
import com.example.ybil_mobile.ui.trip.ActiveTripShelf
import com.example.ybil_mobile.ui.trip.ActiveTripUiState
import com.example.ybil_mobile.ui.trip.ActiveTripViewModel
import com.example.ybil_mobile.ui.trip.ActiveTripViewModelFactory
import kotlinx.coroutines.delay
import java.time.LocalTime

@Composable
fun DepartureBoardScreen(
    onOpenAccount: () -> Unit,
    onRequestUnmark: () -> Unit = {},
    onRequestSwitchTrip: (String) -> Unit = {},
    modifier: Modifier = Modifier
) {
    val application = LocalContext.current.applicationContext as YBiLApplication

    val viewModelFactory = remember(application) {
        DepartureBoardViewModelFactory(repository = application.timetableRepository)
    }
    val viewModel: DepartureBoardViewModel = viewModel(factory = viewModelFactory)
    val uiState by viewModel.uiState.collectAsStateWithLifecycle()

    val authViewModelFactory = remember(application) {
        AuthViewModelFactory(repository = application.authRepository)
    }
    val authViewModel: AuthViewModel = viewModel(factory = authViewModelFactory)
    val authUiState by authViewModel.uiState.collectAsStateWithLifecycle()

    val activeTripViewModelFactory = remember(application) {
        ActiveTripViewModelFactory(
            repository = application.tripRepository,
            context = application.applicationContext
        )
    }
    val activeTripViewModel: ActiveTripViewModel = viewModel(factory = activeTripViewModelFactory)
    val activeTripUiState by activeTripViewModel.uiState.collectAsStateWithLifecycle()

    LaunchedEffect(authUiState.isLoggedIn) {
        if (authUiState.isLoggedIn) {
            activeTripViewModel.loadActiveTrip()
        } else {
            activeTripViewModel.clearLocalState()
        }
    }

    DepartureBoardContent(
        modifier = modifier,
        uiState = uiState,
        authUiState = authUiState,
        activeTripUiState = activeTripUiState,
        onOpenAccount = onOpenAccount,
        onMarkBus = { busId ->
            if (authUiState.isLoggedIn) {
                if (activeTripUiState.activeTrip != null) {
                    onRequestSwitchTrip(busId)
                } else {
                    activeTripViewModel.markTrip(busId)
                }
            } else {
                onOpenAccount()
            }
        },
        onRequestUnmark = onRequestUnmark,
        onMissedClick = {
            activeTripViewModel.handleMissedTrip()
        },
        onRequestSwitchTrip = onRequestSwitchTrip,
        onDismissFallback = {
            activeTripViewModel.dismissMissedFallback()
        },
        onRefresh = viewModel::refreshTimetable
    )
}

@Composable
fun DepartureBoardContent(
    uiState: DepartureBoardUiState,
    authUiState: AuthUiState,
    activeTripUiState: ActiveTripUiState,
    onOpenAccount: () -> Unit,
    onMarkBus: (String) -> Unit,
    onRequestUnmark: () -> Unit,
    onMissedClick: () -> Unit,
    onRequestSwitchTrip: (String) -> Unit,
    onDismissFallback: () -> Unit,
    onRefresh: () -> Unit,
    modifier: Modifier = Modifier
) {
    var currentTime by remember { mutableStateOf(LocalTime.now()) }
    var searchQuery by rememberSaveable { mutableStateOf("") }
    var selectedOperator by rememberSaveable { mutableStateOf("ALL") }
    var selectedCategory by rememberSaveable { mutableStateOf("ALL") }
    var showDeparted by rememberSaveable { mutableStateOf(false) }

    LaunchedEffect(Unit) {
        while (true) {
            currentTime = LocalTime.now()
            delay(15_000)
        }
    }

    val (availableBuses, departedBuses) = remember(uiState.buses, currentTime, searchQuery, selectedOperator, selectedCategory, showDeparted) {
        val query = searchQuery.trim()
        val filtered = uiState.buses.filter { bus ->
            val departureStatus = calculateDepartureStatus(
                leavingTime = bus.leavingTime,
                currentTime = currentTime
            )

            val isVisible = if (showDeparted) {
                departureStatus != DepartureStatus.HIDDEN
            } else {
                departureStatus != DepartureStatus.DEPARTED && departureStatus != DepartureStatus.HIDDEN
            }

            val matchesSearch = query.isBlank() ||
                    bus.routeNumber.contains(query, ignoreCase = true) ||
                    bus.destination.contains(query, ignoreCase = true) ||
                    bus.busNumber?.contains(query, ignoreCase = true) == true
            val matchesOperator = selectedOperator == "ALL" ||
                    bus.operatorType.equals(selectedOperator, ignoreCase = true)
            val matchesCategory = selectedCategory == "ALL" ||
                    bus.busCategory.equals(selectedCategory, ignoreCase = true)

            isVisible && matchesSearch && matchesOperator && matchesCategory
        }

        val (avail, dep) = filtered.partition { bus ->
            calculateDepartureStatus(bus.leavingTime, currentTime) != DepartureStatus.DEPARTED
        }

        val sortedAvail = avail.sortedBy { bus ->
            try { LocalTime.parse(bus.leavingTime) } catch (_: Exception) { LocalTime.MAX }
        }
        val sortedDep = dep.sortedBy { bus ->
            try { LocalTime.parse(bus.leavingTime) } catch (_: Exception) { LocalTime.MIN }
        }

        Pair(sortedAvail, sortedDep)
    }

    val visibleBuses = remember(availableBuses, departedBuses) {
        availableBuses + departedBuses
    }

    val listState = rememberLazyListState()
    val coroutineScope = rememberCoroutineScope()
    val isScrolledPastShelf by remember {
        derivedStateOf {
            activeTripUiState.activeTrip != null && (
                listState.firstVisibleItemIndex > 1 ||
                (listState.firstVisibleItemIndex == 1 && listState.firstVisibleItemScrollOffset > 80)
            )
        }
    }

    val nextDepartureTime = remember(uiState.buses, currentTime) {
        uiState.buses
            .mapNotNull { bus ->
                try {
                    val lt = LocalTime.parse(bus.leavingTime)
                    if (!lt.isBefore(currentTime)) bus to lt else null
                } catch (e: Exception) {
                    null
                }
            }
            .minByOrNull { it.second }
            ?.first?.leavingTime
    }

    val totalActiveRoutes = remember(uiState.buses) {
        uiState.buses.map { it.routeNumber }.distinct().size
    }

    val emptyMessage = when {
        uiState.buses.isEmpty() -> "No timetable entries available."
        searchQuery.isNotBlank() || selectedOperator != "ALL" || selectedCategory != "ALL" ->
            "No departures match your search or filter."
        !showDeparted -> "No upcoming buses right now. Turn on 'Departed' to view past buses."
        else -> "No departures scheduled."
    }

    Column(
        modifier = modifier
            .fillMaxSize()
            .background(MaterialTheme.colorScheme.background)
            .padding(horizontal = 16.dp)
    ) {
        // Top Brand Header: Logo + Brand + Refresh + Account Avatar (Touch-safe, no overlap)
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(vertical = 12.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Column(modifier = Modifier.weight(1f, fill = false)) {
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    Text(
                        text = "YBiL",
                        fontSize = 24.sp,
                        fontWeight = FontWeight.Black,
                        color = MaterialTheme.colorScheme.onBackground,
                        letterSpacing = 1.sp
                    )
                    Box(
                        modifier = Modifier
                            .clip(RoundedCornerShape(6.dp))
                            .background(MaterialTheme.colorScheme.primary.copy(alpha = 0.15f))
                            .padding(horizontal = 6.dp, vertical = 2.dp)
                    ) {
                        Text(
                            text = "LIVE",
                            fontSize = 10.sp,
                            fontWeight = FontWeight.ExtraBold,
                            color = MaterialTheme.colorScheme.primary
                        )
                    }
                }
                Text(
                    text = "Colombo Central Terminal",
                    fontSize = 12.sp,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }

            // Right Action Controls: Refresh + Visual Profile Button (Explicit 38dp sizes with 10dp spacing to prevent overlap)
            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                // Refresh button
                Box(
                    modifier = Modifier
                        .size(38.dp)
                        .clip(RoundedCornerShape(10.dp))
                        .background(MaterialTheme.colorScheme.surface)
                        .border(1.dp, MaterialTheme.colorScheme.outline.copy(alpha = 0.5f), RoundedCornerShape(10.dp))
                        .clickable(onClick = onRefresh),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(
                        imageVector = Icons.Default.Refresh,
                        contentDescription = "Refresh",
                        tint = MaterialTheme.colorScheme.onSurfaceVariant,
                        modifier = Modifier.size(18.dp)
                    )
                }

                // Visual Profile Avatar (Item 2 & 7: Account icon, no username initial, clear border in light mode)
                Box(
                    modifier = Modifier
                        .size(38.dp)
                        .clip(RoundedCornerShape(10.dp))
                        .background(
                            if (authUiState.isLoggedIn) MaterialTheme.colorScheme.primary.copy(alpha = 0.12f)
                            else MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.4f)
                        )
                        .border(
                            width = if (authUiState.isLoggedIn) 1.5.dp else 1.dp,
                            color = if (authUiState.isLoggedIn) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.outline.copy(alpha = 0.6f),
                            shape = RoundedCornerShape(10.dp)
                        )
                        .clickable(onClick = onOpenAccount),
                    contentAlignment = Alignment.Center
                ) {
                    Box(contentAlignment = Alignment.TopEnd) {
                        Icon(
                            imageVector = Icons.Default.Person,
                            contentDescription = "Account",
                            tint = if (authUiState.isLoggedIn) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.onSurfaceVariant,
                            modifier = Modifier.size(20.dp)
                        )

                        if (authUiState.isLoggedIn) {
                            Box(
                                modifier = Modifier
                                    .size(6.dp)
                                    .clip(CircleShape)
                                    .background(Color(0xFF25856F))
                            )
                        }
                    }
                }
            }
        }

        // Sticky Mini Active Trip Bar (Appears when scrolled past the main shelf)
        AnimatedVisibility(
            visible = isScrolledPastShelf && activeTripUiState.activeTrip != null,
            enter = fadeIn() + expandVertically(),
            exit = fadeOut() + shrinkVertically()
        ) {
            activeTripUiState.activeTrip?.let { trip ->
                val departureStatus = calculateDepartureStatus(trip.leavingTime, currentTime)
                val minutesUntilDeparture = calculateMinutesUntilDeparture(trip.leavingTime, currentTime)
                val isDark = MaterialTheme.colorScheme.surface.luminance() < 0.5f

                val (badgeBg, badgeTextColor, badgeLabel) = when {
                    trip.status.equals("MISSED", ignoreCase = true) ->
                        Triple(Color(0xFFDC2626), Color.White, "MISSED")
                    departureStatus == DepartureStatus.URGENT ->
                        Triple(Color(0xFFDC2626), Color.White, "BOARDING")
                    departureStatus == DepartureStatus.LEAVING_NOW ->
                        Triple(Color(0xFFEA580C), Color.White, "LEAVING NOW")
                    departureStatus == DepartureStatus.DEPARTED || departureStatus == DepartureStatus.HIDDEN ->
                        Triple(Color(0xFF64748B), Color.White, "DEPARTED")
                    minutesUntilDeparture in 0..60 ->
                        Triple(if (isDark) Color(0xFF2563EB) else Color(0xFFDBEAFE), if (isDark) Color.White else Color(0xFF1E40AF), "IN ${minutesUntilDeparture}M")
                    else ->
                        Triple(if (isDark) Color(0xFF2563EB) else Color(0xFFDBEAFE), if (isDark) Color.White else Color(0xFF1E40AF), "SCHEDULED")
                }

                Card(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(bottom = 8.dp)
                        .clickable {
                            coroutineScope.launch {
                                listState.animateScrollToItem(0)
                            }
                        },
                    shape = RoundedCornerShape(12.dp),
                    colors = CardDefaults.cardColors(
                        containerColor = if (isDark) Color(0xFF1E293B) else Color(0xFFEFF6FF)
                    ),
                    border = androidx.compose.foundation.BorderStroke(
                        width = 1.dp,
                        color = if (isDark) Color(0xFF3B82F6) else Color(0xFF93C5FD)
                    ),
                    elevation = CardDefaults.cardElevation(defaultElevation = 3.dp)
                ) {
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(horizontal = 12.dp, vertical = 8.dp),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(8.dp),
                            modifier = Modifier.weight(1f, fill = false)
                        ) {
                            Icon(
                                imageVector = Icons.Default.DirectionsBus,
                                contentDescription = null,
                                tint = if (isDark) Color(0xFF60A5FA) else Color(0xFF2563EB),
                                modifier = Modifier.size(18.dp)
                            )
                            Text(
                                text = trip.destination,
                                fontSize = 13.sp,
                                fontWeight = FontWeight.Bold,
                                color = if (isDark) Color.White else Color(0xFF1E3A8A),
                                maxLines = 1,
                                overflow = TextOverflow.Ellipsis
                            )
                            Text(
                                text = trip.leavingTime,
                                fontSize = 13.sp,
                                fontWeight = FontWeight.ExtraBold,
                                color = if (isDark) Color(0xFF93C5FD) else Color(0xFF1D4ED8)
                            )
                        }

                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(6.dp)
                        ) {
                            Box(
                                modifier = Modifier
                                    .clip(RoundedCornerShape(6.dp))
                                    .background(badgeBg)
                                    .padding(horizontal = 8.dp, vertical = 3.dp)
                            ) {
                                Text(
                                    text = badgeLabel,
                                    fontSize = 10.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = badgeTextColor
                                )
                            }

                            Icon(
                                imageVector = Icons.Default.KeyboardArrowUp,
                                contentDescription = "Scroll to top",
                                tint = if (isDark) Color(0xFF94A3B8) else Color(0xFF64748B),
                                modifier = Modifier.size(18.dp)
                            )
                        }
                    }
                }
            }
        }

        // Lazy Column list
        LazyColumn(
            state = listState,
            modifier = Modifier
                .fillMaxWidth()
                .weight(1f),
            verticalArrangement = Arrangement.spacedBy(14.dp)
        ) {
            // Hero Card
            item {
                HeroCard(
                    totalBusesToday = uiState.buses.size,
                    nextDepartureTime = nextDepartureTime,
                    totalActiveRoutes = totalActiveRoutes,
                    selectedOperator = selectedOperator
                )
            }

            // Active Trip Shelf (if passenger marked a bus)
            activeTripUiState.activeTrip?.let { trip ->
                item {
                    ActiveTripShelf(
                        trip = trip,
                        missedFallback = activeTripUiState.missedFallback,
                        allBuses = uiState.buses,
                        currentTime = currentTime,
                        onRequestUnmark = onRequestUnmark,
                        onMissedClick = onMissedClick,
                        onRequestSwitchTrip = onRequestSwitchTrip,
                        onDismissFallback = onDismissFallback
                    )
                }
            }

            // Loading / Error Banners
            if (uiState.isLoading) {
                item {
                    Text(
                        text = "Syncing live timetable...",
                        color = MaterialTheme.colorScheme.primary,
                        fontSize = 12.sp
                    )
                }
            }

            if (uiState.errorMessage != null) {
                item {
                    Card(
                        modifier = Modifier.fillMaxWidth(),
                        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                        shape = RoundedCornerShape(10.dp)
                    ) {
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(12.dp),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Text(
                                text = if (uiState.buses.isNotEmpty()) "Offline: showing cached departures" else "Network unavailable",
                                color = Color(0xFFF87171),
                                fontSize = 12.sp,
                                fontWeight = FontWeight.SemiBold
                            )
                            Button(
                                onClick = onRefresh,
                                shape = RoundedCornerShape(6.dp),
                                colors = ButtonDefaults.buttonColors(containerColor = MaterialTheme.colorScheme.primary)
                            ) {
                                Text("Retry", fontSize = 11.sp)
                            }
                        }
                    }
                }
            }

            // Search Bar
            item {
                OutlinedTextField(
                    value = searchQuery,
                    onValueChange = { searchQuery = it },
                    placeholder = {
                        Text(
                            text = "Search route, destination or bus...",
                            color = MaterialTheme.colorScheme.onSurfaceVariant.copy(alpha = 0.7f),
                            fontSize = 13.sp
                        )
                    },
                    leadingIcon = {
                        Icon(
                            imageVector = Icons.Default.Search,
                            contentDescription = "Search",
                            tint = MaterialTheme.colorScheme.onSurfaceVariant,
                            modifier = Modifier.size(18.dp)
                        )
                    },
                    singleLine = true,
                    shape = RoundedCornerShape(12.dp),
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedContainerColor = MaterialTheme.colorScheme.surface,
                        unfocusedContainerColor = MaterialTheme.colorScheme.surface,
                        focusedBorderColor = MaterialTheme.colorScheme.primary,
                        unfocusedBorderColor = MaterialTheme.colorScheme.outline.copy(alpha = 0.5f),
                        focusedTextColor = MaterialTheme.colorScheme.onSurface,
                        unfocusedTextColor = MaterialTheme.colorScheme.onSurface
                    ),
                    modifier = Modifier.fillMaxWidth()
                )
            }

            // Filter Chips (Operator & Category)
            item {
                Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    // Operator Filter
                    Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        PwaFilterChip(
                            label = "All Operators",
                            isSelected = selectedOperator == "ALL",
                            onClick = { selectedOperator = "ALL" }
                        )
                        PwaFilterChip(
                            label = "SLTB",
                            isSelected = selectedOperator == "SLTB",
                            onClick = { selectedOperator = "SLTB" }
                        )
                        PwaFilterChip(
                            label = "Private",
                            isSelected = selectedOperator == "PRIVATE",
                            onClick = { selectedOperator = "PRIVATE" }
                        )
                    }

                    // Category Filter (horizontal scrollable)
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .horizontalScroll(rememberScrollState()),
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        PwaFilterChip(
                            label = "All Categories",
                            isSelected = selectedCategory == "ALL",
                            onClick = { selectedCategory = "ALL" }
                        )
                        PwaFilterChip(
                            label = "Normal",
                            isSelected = selectedCategory == "NORMAL",
                            onClick = { selectedCategory = "NORMAL" }
                        )
                        PwaFilterChip(
                            label = "Semi Luxury",
                            isSelected = selectedCategory == "SEMI",
                            onClick = { selectedCategory = "SEMI" }
                        )
                        PwaFilterChip(
                            label = "Luxury AC",
                            isSelected = selectedCategory == "LUXURY_AC",
                            onClick = { selectedCategory = "LUXURY_AC" }
                        )
                        PwaFilterChip(
                            label = "Expressway",
                            isSelected = selectedCategory == "EXPRESSWAY",
                            onClick = { selectedCategory = "EXPRESSWAY" }
                        )
                    }
                }
            }

            // Sub-header: Services Count & Departed Visibility Switch (Item 2)
            item {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(vertical = 4.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = "${visibleBuses.size} ${if (visibleBuses.size == 1) "service" else "services"} found",
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                        fontSize = 12.sp,
                        fontWeight = FontWeight.Bold
                    )

                    // Switch / Toggle button for Departed Buses (Item 2)
                    FilterChip(
                        selected = showDeparted,
                        onClick = { showDeparted = !showDeparted },
                        leadingIcon = {
                            Icon(
                                imageVector = if (showDeparted) Icons.Default.Visibility else Icons.Default.VisibilityOff,
                                contentDescription = null,
                                modifier = Modifier.size(14.dp)
                            )
                        },
                        label = {
                            Text(
                                text = "Departed",
                                fontSize = 11.sp,
                                fontWeight = if (showDeparted) FontWeight.Bold else FontWeight.Medium
                            )
                        },
                        shape = RoundedCornerShape(10.dp),
                        colors = FilterChipDefaults.filterChipColors(
                            selectedContainerColor = MaterialTheme.colorScheme.primaryContainer,
                            selectedLabelColor = MaterialTheme.colorScheme.onPrimaryContainer,
                            selectedLeadingIconColor = MaterialTheme.colorScheme.onPrimaryContainer,
                            containerColor = MaterialTheme.colorScheme.surface,
                            labelColor = MaterialTheme.colorScheme.onSurfaceVariant,
                            iconColor = MaterialTheme.colorScheme.onSurfaceVariant
                        ),
                        border = FilterChipDefaults.filterChipBorder(
                            borderColor = if (showDeparted) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.outline.copy(alpha = 0.5f),
                            enabled = true,
                            selected = showDeparted
                        ),
                        modifier = Modifier.height(30.dp)
                    )
                }
            }

            // Departures or Empty State
            if (visibleBuses.isEmpty() && !uiState.isLoading) {
                item {
                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(vertical = 32.dp),
                        contentAlignment = Alignment.Center
                    ) {
                        Text(
                            text = emptyMessage,
                            color = MaterialTheme.colorScheme.onSurfaceVariant,
                            fontSize = 13.sp
                        )
                    }
                }
            } else {
                items(
                    items = availableBuses,
                    key = { it.id }
                ) { bus ->
                    val isMarked = activeTripUiState.activeTrip?.timetableEntryId == bus.id

                    BusCard(
                        bus = bus,
                        currentTime = currentTime,
                        isMarked = isMarked,
                        onMarkClick = {
                            if (isMarked) {
                                onRequestUnmark()
                            } else {
                                onMarkBus(bus.id)
                            }
                        }
                    )
                }

                if (showDeparted && departedBuses.isNotEmpty()) {
                    item(key = "departed_divider_header") {
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(top = 10.dp, bottom = 2.dp),
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(8.dp)
                        ) {
                            HorizontalDivider(
                                modifier = Modifier.weight(1f),
                                color = MaterialTheme.colorScheme.outline.copy(alpha = 0.3f)
                            )
                            Text(
                                text = "DEPARTED SERVICES (${departedBuses.size})",
                                fontSize = 11.sp,
                                fontWeight = FontWeight.Bold,
                                color = MaterialTheme.colorScheme.onSurfaceVariant.copy(alpha = 0.7f),
                                letterSpacing = 0.5.sp
                            )
                            HorizontalDivider(
                                modifier = Modifier.weight(1f),
                                color = MaterialTheme.colorScheme.outline.copy(alpha = 0.3f)
                            )
                        }
                    }

                    items(
                        items = departedBuses,
                        key = { it.id }
                    ) { bus ->
                        val isMarked = activeTripUiState.activeTrip?.timetableEntryId == bus.id

                        BusCard(
                            bus = bus,
                            currentTime = currentTime,
                            isMarked = isMarked,
                            onMarkClick = {
                                if (isMarked) {
                                    onRequestUnmark()
                                } else {
                                    onMarkBus(bus.id)
                                }
                            }
                        )
                    }
                }
            }

            item {
                Spacer(modifier = Modifier.height(16.dp))
            }
        }
    }
}

@Composable
private fun PwaFilterChip(
    label: String,
    isSelected: Boolean,
    onClick: () -> Unit
) {
    FilterChip(
        selected = isSelected,
        onClick = onClick,
        label = {
            Text(
                text = label,
                fontSize = 12.sp,
                fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Normal
            )
        },
        shape = RoundedCornerShape(8.dp),
        colors = FilterChipDefaults.filterChipColors(
            selectedContainerColor = MaterialTheme.colorScheme.primary,
            selectedLabelColor = MaterialTheme.colorScheme.onPrimary,
            containerColor = MaterialTheme.colorScheme.surface,
            labelColor = MaterialTheme.colorScheme.onSurfaceVariant
        ),
        border = FilterChipDefaults.filterChipBorder(
            borderColor = if (isSelected) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.outline.copy(alpha = 0.5f),
            enabled = true,
            selected = isSelected
        )
    )
}

@Composable
private fun BusCard(
    bus: BusUiModel,
    currentTime: LocalTime,
    isMarked: Boolean,
    onMarkClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    val departureStatus = calculateDepartureStatus(bus.leavingTime, currentTime)
    val minutesUntilDeparture = calculateMinutesUntilDeparture(bus.leavingTime, currentTime)
    val countdownText = displayDepartureCountdown(departureStatus, minutesUntilDeparture)
    val isSltb = bus.operatorType.equals("SLTB", ignoreCase = true)
    val isDeparted = departureStatus == DepartureStatus.DEPARTED || departureStatus == DepartureStatus.HIDDEN

    Card(
        modifier = modifier.fillMaxWidth(),
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
        border = androidx.compose.foundation.BorderStroke(
            width = if (isMarked) 1.5.dp else 1.dp,
            color = if (isMarked) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.outline.copy(alpha = 0.4f)
        ),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Row(modifier = Modifier.fillMaxWidth()) {
            // Left Operator Accent Strip
            Box(
                modifier = Modifier
                    .width(5.dp)
                    .height(160.dp)
                    .background(if (isSltb) Color(0xFFE94B50) else Color(0xFFF59E0B))
            )

            Column(
                modifier = Modifier
                    .weight(1f)
                    .padding(14.dp),
                verticalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                // Top Tag Badges Row
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(6.dp)
                    ) {
                        // Route badge
                        Box(
                            modifier = Modifier
                                .clip(RoundedCornerShape(6.dp))
                                .background(MaterialTheme.colorScheme.primaryContainer)
                                .padding(horizontal = 8.dp, vertical = 3.dp)
                        ) {
                            Text(
                                text = "Route ${bus.routeNumber}",
                                color = MaterialTheme.colorScheme.onPrimaryContainer,
                                fontSize = 12.sp,
                                fontWeight = FontWeight.Bold
                            )
                        }

                        // Operator badge
                        Box(
                            modifier = Modifier
                                .clip(RoundedCornerShape(6.dp))
                                .background(
                                    if (isSltb) Color(0xFFE94B50).copy(alpha = 0.15f)
                                    else Color(0xFFF59E0B).copy(alpha = 0.15f)
                                )
                                .padding(horizontal = 6.dp, vertical = 3.dp)
                        ) {
                            Text(
                                text = if (isSltb) "SLTB" else "PRIVATE",
                                color = if (isSltb) Color(0xFFE94B50) else Color(0xFFD97706),
                                fontSize = 10.sp,
                                fontWeight = FontWeight.Bold
                            )
                        }

                        // Category badge
                        Box(
                            modifier = Modifier
                                .clip(RoundedCornerShape(6.dp))
                                .background(MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.6f))
                                .padding(horizontal = 6.dp, vertical = 3.dp)
                        ) {
                            Text(
                                text = displayCategory(bus.busCategory),
                                color = MaterialTheme.colorScheme.onSurfaceVariant,
                                fontSize = 10.sp,
                                fontWeight = FontWeight.Medium
                            )
                        }
                    }

                    // Live Status Chip
                    StatusChip(status = departureStatus, countdownText = countdownText)
                }

                // Destination & Bus Details
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column(modifier = Modifier.weight(1f)) {
                        Text(
                            text = bus.destination.uppercase(),
                            color = MaterialTheme.colorScheme.onSurface,
                            fontSize = 17.sp,
                            fontWeight = FontWeight.ExtraBold,
                            letterSpacing = 0.5.sp
                        )
                        Text(
                            text = if (!bus.busNumber.isNullOrBlank()) "Bus No: ${bus.busNumber}" else "Scheduled Service",
                            color = MaterialTheme.colorScheme.onSurfaceVariant,
                            fontSize = 11.sp
                        )
                    }
                }

                HorizontalDivider(color = MaterialTheme.colorScheme.outline.copy(alpha = 0.3f))

                // Schedule times (Parking & Leaving)
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column {
                        Text(
                            text = "PARKING / BAYS",
                            color = MaterialTheme.colorScheme.onSurfaceVariant,
                            fontSize = 9.sp,
                            fontWeight = FontWeight.Bold,
                            letterSpacing = 0.8.sp
                        )
                        Text(
                            text = bus.parkingTime,
                            color = MaterialTheme.colorScheme.onSurface,
                            fontSize = 14.sp,
                            fontWeight = FontWeight.SemiBold
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
                            text = bus.leavingTime,
                            color = MaterialTheme.colorScheme.primary,
                            fontSize = 17.sp,
                            fontWeight = FontWeight.Black
                        )
                    }
                }

                // Mark / Unmark Action (Item 1: Disable Mark Bus button for departed buses)
                if (isMarked) {
                    Button(
                        onClick = onMarkClick,
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(10.dp),
                        colors = ButtonDefaults.buttonColors(
                            containerColor = MaterialTheme.colorScheme.surfaceVariant,
                            contentColor = MaterialTheme.colorScheme.primary
                        ),
                        border = androidx.compose.foundation.BorderStroke(1.dp, MaterialTheme.colorScheme.primary)
                    ) {
                        Text(
                            text = "✓ Tracking Bus • Tap to Unmark",
                            fontSize = 12.sp,
                            fontWeight = FontWeight.Bold
                        )
                    }
                } else if (isDeparted) {
                    // Item 1: Disabled button for departed buses
                    Button(
                        onClick = {},
                        enabled = false,
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(10.dp),
                        colors = ButtonDefaults.buttonColors(
                            disabledContainerColor = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.4f),
                            disabledContentColor = MaterialTheme.colorScheme.onSurfaceVariant.copy(alpha = 0.5f)
                        )
                    ) {
                        Text(
                            text = "Bus Departed",
                            fontSize = 12.sp,
                            fontWeight = FontWeight.Bold
                        )
                    }
                } else {
                    Button(
                        onClick = onMarkClick,
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(10.dp),
                        colors = ButtonDefaults.buttonColors(
                            containerColor = MaterialTheme.colorScheme.primary,
                            contentColor = MaterialTheme.colorScheme.onPrimary
                        )
                    ) {
                        Text(
                            text = "Mark Bus for Countdown Alerts",
                            fontSize = 12.sp,
                            fontWeight = FontWeight.Bold
                        )
                    }
                }
            }
        }
    }
}

@Composable
private fun StatusChip(
    status: DepartureStatus,
    countdownText: String
) {
    val (bgColor, textColor) = when (status) {
        DepartureStatus.UPCOMING -> MaterialTheme.colorScheme.primary.copy(alpha = 0.15f) to MaterialTheme.colorScheme.primary
        DepartureStatus.URGENT -> Color(0xFFDC2626).copy(alpha = 0.15f) to Color(0xFFEF4444)
        DepartureStatus.LEAVING_NOW -> Color(0xFFEA580C).copy(alpha = 0.2f) to Color(0xFFF97316)
        DepartureStatus.DEPARTED -> Color(0xFF64748B).copy(alpha = 0.2f) to Color(0xFF94A3B8)
        DepartureStatus.HIDDEN -> Color(0xFF334155).copy(alpha = 0.2f) to Color(0xFF64748B)
    }

    Box(
        modifier = Modifier
            .clip(RoundedCornerShape(6.dp))
            .background(bgColor)
            .padding(horizontal = 8.dp, vertical = 4.dp)
    ) {
        Text(
            text = countdownText,
            color = textColor,
            fontSize = 11.sp,
            fontWeight = FontWeight.Bold
        )
    }
}

private fun displayCategory(busCategory: String): String {
    return when (busCategory.uppercase()) {
        "NORMAL" -> "Normal"
        "SEMI" -> "Semi Luxury"
        "LUXURY_AC" -> "Luxury AC"
        "EXPRESSWAY" -> "Expressway"
        else -> busCategory
    }
}

private fun displayDepartureCountdown(
    status: DepartureStatus,
    minutesUntilDeparture: Long
): String {
    return when (status) {
        DepartureStatus.UPCOMING -> "$minutesUntilDeparture min"
        DepartureStatus.URGENT -> "Leaving in $minutesUntilDeparture min"
        DepartureStatus.LEAVING_NOW -> "Leaving now"
        DepartureStatus.DEPARTED -> "Departed ${-minutesUntilDeparture} min ago"
        DepartureStatus.HIDDEN -> "Past"
    }
}
