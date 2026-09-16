package com.example.ybil_mobile

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Scaffold
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.lifecycle.viewmodel.compose.viewModel
import com.example.ybil_mobile.ui.account.AccountScreen
import com.example.ybil_mobile.ui.auth.AuthBottomSheet
import com.example.ybil_mobile.ui.auth.AuthViewModel
import com.example.ybil_mobile.ui.auth.AuthViewModelFactory
import com.example.ybil_mobile.ui.board.DepartureBoardScreen
import com.example.ybil_mobile.ui.board.DepartureBoardViewModel
import com.example.ybil_mobile.ui.board.DepartureBoardViewModelFactory
import com.example.ybil_mobile.ui.common.ConfirmationDialog
import com.example.ybil_mobile.ui.common.NotificationAndAlarmPermissionHandler
import com.example.ybil_mobile.ui.legal.LegalDisclaimerDialog
import com.example.ybil_mobile.ui.legal.PrivacyPolicyScreen
import com.example.ybil_mobile.ui.navigation.AppTab
import com.example.ybil_mobile.ui.navigation.YBiLBottomNavBar
import com.example.ybil_mobile.ui.theme.YbilmobileTheme
import com.example.ybil_mobile.ui.trip.ActiveTripScreen
import com.example.ybil_mobile.ui.trip.ActiveTripViewModel
import com.example.ybil_mobile.ui.trip.ActiveTripViewModelFactory
import kotlinx.coroutines.launch

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            val application = LocalContext.current.applicationContext as YBiLApplication
            val sessionManager = application.sessionManager
            val themeMode by sessionManager.themeModeFlow.collectAsStateWithLifecycle(initialValue = "SYSTEM")

            YbilmobileTheme(themeMode = themeMode) {
                MainRootScreen(
                    themeMode = themeMode
                )
            }
        }
    }
}

@Composable
fun MainRootScreen(
    themeMode: String = "SYSTEM",
    onThemeModeChange: (String) -> Unit = {}
) {
    val application = LocalContext.current.applicationContext as YBiLApplication
    val coroutineScope = rememberCoroutineScope()

    val sessionManager = application.sessionManager
    val isDisclaimerAccepted by sessionManager.isDisclaimerAcceptedFlow.collectAsStateWithLifecycle(initialValue = null)
    val isPermissionsHandled by sessionManager.isPermissionsHandledFlow.collectAsStateWithLifecycle(initialValue = null)

    var currentTab by rememberSaveable { mutableStateOf(AppTab.DEPARTURES) }
    var showAuthSheet by rememberSaveable { mutableStateOf(false) }

    // Sub-screen states
    var viewingPrivacyPolicy by rememberSaveable { mutableStateOf(false) }
    var viewingDisclaimerDialog by rememberSaveable { mutableStateOf(false) }

    // Confirmation dialog states (Item 7)
    var showUnmarkConfirmation by rememberSaveable { mutableStateOf(false) }
    var showLogoutConfirmation by rememberSaveable { mutableStateOf(false) }
    var pendingSwitchBusId by rememberSaveable { mutableStateOf<String?>(null) }

    val authViewModel: AuthViewModel = viewModel(
        factory = remember(application) {
            AuthViewModelFactory(repository = application.authRepository)
        }
    )
    val authUiState by authViewModel.uiState.collectAsStateWithLifecycle()

    val activeTripViewModel: ActiveTripViewModel = viewModel(
        factory = remember(application) {
            ActiveTripViewModelFactory(
                repository = application.tripRepository,
                context = application.applicationContext
            )
        }
    )
    val activeTripUiState by activeTripViewModel.uiState.collectAsStateWithLifecycle()

    val boardViewModel: DepartureBoardViewModel = viewModel(
        factory = remember(application) {
            DepartureBoardViewModelFactory(repository = application.timetableRepository)
        }
    )
    val boardUiState by boardViewModel.uiState.collectAsStateWithLifecycle()

    LaunchedEffect(authUiState.isLoggedIn) {
        if (authUiState.isLoggedIn) {
            activeTripViewModel.loadActiveTrip()
        } else {
            activeTripViewModel.clearLocalState()
        }
    }

    // 2-Step Permission Request Handler (Post Notifications + Exact Alarms) - only asked once
    if (isPermissionsHandled == false) {
        NotificationAndAlarmPermissionHandler(
            onPermissionsHandled = {
                coroutineScope.launch {
                    sessionManager.setPermissionsHandled(true)
                }
            }
        )
    }

    Scaffold(
        modifier = Modifier.fillMaxSize(),
        containerColor = MaterialTheme.colorScheme.background,
        bottomBar = {
            YBiLBottomNavBar(
                currentTab = currentTab,
                onTabSelected = { tab ->
                    viewingPrivacyPolicy = false
                    currentTab = tab
                },
                hasActiveTrip = activeTripUiState.activeTrip != null
            )
        }
    ) { innerPadding ->
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding)
                .background(MaterialTheme.colorScheme.background)
        ) {
            when (currentTab) {
                AppTab.DEPARTURES -> {
                    DepartureBoardScreen(
                        onOpenAccount = { currentTab = AppTab.ACCOUNT },
                        onRequestUnmark = { showUnmarkConfirmation = true },
                        onRequestSwitchTrip = { newBusId ->
                            if (activeTripUiState.activeTrip != null) {
                                pendingSwitchBusId = newBusId
                            } else {
                                activeTripViewModel.markTrip(newBusId)
                            }
                        }
                    )
                }

                AppTab.ACTIVE_TRIP -> {
                    ActiveTripScreen(
                        activeTripUiState = activeTripUiState,
                        allBuses = boardUiState.buses,
                        onRequestUnmark = { showUnmarkConfirmation = true },
                        onMissedClick = { activeTripViewModel.handleMissedTrip() },
                        onRequestSwitchTrip = { newBusId ->
                            pendingSwitchBusId = newBusId
                        },
                        onDismissFallback = { activeTripViewModel.dismissMissedFallback() },
                        onBrowseDepartures = { currentTab = AppTab.DEPARTURES }
                    )
                }

                AppTab.ACCOUNT -> {
                    if (viewingPrivacyPolicy) {
                        PrivacyPolicyScreen(
                            onBack = { viewingPrivacyPolicy = false }
                        )
                    } else {
                        AccountScreen(
                            authUiState = authUiState,
                            themeMode = themeMode,
                            onThemeModeChange = { newMode ->
                                coroutineScope.launch { sessionManager.setThemeMode(newMode) }
                            },
                            onOpenAuthSheet = { showAuthSheet = true },
                            onRequestLogout = { showLogoutConfirmation = true },
                            onViewPrivacyPolicy = { viewingPrivacyPolicy = true },
                            onViewDisclaimer = { viewingDisclaimerDialog = true }
                        )
                    }
                }
            }
        }
    }

    // Confirmation Prompt: Unmark Trip (Item 7)
    if (showUnmarkConfirmation) {
        val trip = activeTripUiState.activeTrip
        ConfirmationDialog(
            title = "Unmark Active Bus?",
            message = "Are you sure you want to stop tracking this bus? All upcoming departure alerts and countdown alarms for Route ${trip?.routeNumber ?: ""} will be canceled.",
            confirmButtonText = "Unmark",
            dismissButtonText = "Keep Tracking",
            isDestructive = true,
            onConfirm = {
                activeTripViewModel.cancelActiveTrip()
                showUnmarkConfirmation = false
            },
            onDismiss = {
                showUnmarkConfirmation = false
            }
        )
    }

    // Confirmation Prompt: Logout (Item 7)
    if (showLogoutConfirmation) {
        ConfirmationDialog(
            title = "Log Out?",
            message = "Are you sure you want to log out of your YBiL account? Your active trip notifications will be cleared on this device.",
            confirmButtonText = "Log Out",
            dismissButtonText = "Cancel",
            isDestructive = true,
            onConfirm = {
                authViewModel.logout()
                showLogoutConfirmation = false
            },
            onDismiss = {
                showLogoutConfirmation = false
            }
        )
    }

    // Confirmation Prompt: Switch Trip (Item 7)
    pendingSwitchBusId?.let { newBusId ->
        val currentTrip = activeTripUiState.activeTrip
        val newBus = boardUiState.buses.find { it.id == newBusId }
        val newBusLabel = if (newBus != null) "Route ${newBus.routeNumber} (${newBus.leavingTime})" else "this bus"

        ConfirmationDialog(
            title = "Switch Active Trip?",
            message = "You are currently tracking Route ${currentTrip?.routeNumber ?: ""}. Would you like to switch tracking to $newBusLabel instead?",
            confirmButtonText = "Switch Bus",
            dismissButtonText = "Cancel",
            onConfirm = {
                activeTripViewModel.markTrip(newBusId)
                pendingSwitchBusId = null
            },
            onDismiss = {
                pendingSwitchBusId = null
            }
        )
    }

    // First Launch Legal Disclaimer Modal
    if (isDisclaimerAccepted == false || viewingDisclaimerDialog) {
        LegalDisclaimerDialog(
            onAccept = {
                coroutineScope.launch {
                    sessionManager.setDisclaimerAccepted(true)
                }
                viewingDisclaimerDialog = false
            },
            onViewFullPolicy = {
                viewingDisclaimerDialog = false
                currentTab = AppTab.ACCOUNT
                viewingPrivacyPolicy = true
            }
        )
    }

    // Auth Bottom Sheet
    if (showAuthSheet) {
        AuthBottomSheet(
            uiState = authUiState,
            onLogin = authViewModel::login,
            onRegister = authViewModel::register,
            onLogout = authViewModel::logout,
            onClearError = authViewModel::clearError,
            onDismiss = { showAuthSheet = false }
        )
    }
}
