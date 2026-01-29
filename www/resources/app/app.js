/**
 * DashCam App
 * Main application file
 */

// Initialize store
AppStore.init();

// Connection check interval
var connectionCheckInterval = null;
var vConsole = new VConsole();

// Create Framework7 App
var app = new Framework7({
    root: '#app',
    name: 'DashCam',
    id: 'com.dashcam.app',
    theme: 'auto',
    
    // Store data
    data: function() {
        return {
            isConnected: false,
            selectedCamera: null
        };
    },
    
    // App methods
    methods: {
        // Check camera connection
        checkConnection: function() {
            var self = this;
            return DASHCAM_API.checkConnection().then(function(connected) {
                var wasConnected = AppStore.state.isConnected;
                AppStore.setConnected(connected);
                self.data.isConnected = connected;
                
                // Show toast if connection state changed
                if (connected && !wasConnected) {
                    self.toast.show({
                        text: 'Dashcam connected!',
                        position: 'center',
                        closeTimeout: 2000
                    });
                }
                
                return connected;
            });
        },
        
        // Connect to camera - opens WiFi settings if not connected
        connectToCamera: function() {
            var self = this;
            
            // First check if already connected
            self.preloader.show();
            
            return DASHCAM_API.checkConnection().then(function(connected) {
                self.preloader.hide();
                
                if (connected) {
                    AppStore.setConnected(true);
                    self.data.isConnected = true;
                    self.toast.show({
                        text: 'Connected to dashcam!',
                        position: 'center',
                        closeTimeout: 2000
                    });
                    return true;
                } else {
                    // Not connected - open WiFi settings
                    self.dialog.confirm(
                        'Please connect to your dashcam WiFi network (usually starts with "DASHCAM" or similar).',
                        'Open WiFi Settings',
                        function() {
                            openWiFiSettings();
                            // Start checking for connection after user goes to WiFi settings
                            startConnectionPolling();
                        }
                    );
                    return false;
                }
            }).catch(function() {
                self.preloader.hide();
                // Open WiFi settings on error too
                self.dialog.confirm(
                    'Cannot reach dashcam. Please connect to dashcam WiFi.',
                    'Open WiFi Settings',
                    function() {
                        openWiFiSettings();
                        startConnectionPolling();
                    }
                );
                return false;
            });
        },
        
        // Take photo
        takePhoto: function() {
            var self = this;
            
            if (!AppStore.state.isConnected) {
                self.methods.connectToCamera();
                return;
            }
            
            self.preloader.show();
            
            DASHCAM_API.takePhoto().then(function(success) {
                self.preloader.hide();
                if (success) {
                    self.toast.show({
                        text: 'Photo captured!',
                        position: 'center',
                        closeTimeout: 2000
                    });
                } else {
                    self.toast.show({
                        text: 'Failed to take photo',
                        position: 'center',
                        closeTimeout: 2000
                    });
                }
            }).catch(function() {
                self.preloader.hide();
                self.toast.show({
                    text: 'Error taking photo',
                    position: 'center',
                    closeTimeout: 2000
                });
            });
        },
        
        // Toggle recording
        toggleRecording: function() {
            var self = this;
            
            if (!AppStore.state.isConnected) {
                self.methods.connectToCamera();
                return Promise.resolve(false);
            }
            
            if (AppStore.state.isRecording) {
                return DASHCAM_API.stopRecording().then(function() {
                    AppStore.setRecording(false);
                    self.toast.show({
                        text: 'Recording stopped',
                        position: 'center',
                        closeTimeout: 2000
                    });
                    return false;
                });
            } else {
                return DASHCAM_API.startRecording().then(function() {
                    AppStore.setRecording(true);
                    self.toast.show({
                        text: 'Recording started',
                        position: 'center',
                        closeTimeout: 2000
                    });
                    return true;
                });
            }
        },
        
        // Open camera selector
        openCameraSelector: function() {
            var self = this;
            var cameras = AppStore.state.cameras;
            
            if (cameras.length === 0) {
                self.dialog.confirm(
                    'No cameras added. Add one now?',
                    'Add Camera',
                    function() {
                        mainView.router.navigate('/add-camera/');
                    }
                );
                return;
            }
            
            var buttons = cameras.map(function(camera) {
                return {
                    text: camera.name + ' (' + camera.ip + ')',
                    onClick: function() {
                        AppStore.selectCamera(camera);
                        self.methods.checkConnection();
                    }
                };
            });
            
            buttons.push({
                text: 'Add New Camera',
                color: 'blue',
                onClick: function() {
                    mainView.router.navigate('/add-camera/');
                }
            });
            
            buttons.push({
                text: 'Cancel',
                color: 'red'
            });
            
            self.actions.create({
                buttons: [buttons]
            }).open();
        },
        
        // Open live stream
        openLiveStream: function() {
            var self = this;
            var url = AppStore.getCurrentStreamUrl();

            if (!AppStore.state.isConnected) {
                self.methods.connectToCamera();
                return;
            }
            
            //mainView.router.navigate('/live/');


            if (window.RtspPlayer) {
                    window.RtspPlayer.play(url,
                        function(status) {
                            console.log('[Live] Player status:', status);
                          
                        },
                        function(error) {
                            self.toast.show({
                                text: 'Stream error: ' + error,
                                position: 'center',
                                closeTimeout: 3000
                            });
                        }
                    );
                } else {
                    console.log('[Live] RtspPlayer plugin not available, trying external player');
                    self.methods.openExternalPlayer();
                }
        },


        openExternalPlayer: function() {
            var url = AppStore.getCurrentStreamUrl();
            
            // Try to open with system player
            if (window.cordova && window.cordova.InAppBrowser) {
                window.cordova.InAppBrowser.open(url, '_system');
            } else {
                window.open(url, '_blank');
            }
        },
        
        // Format date
        formatDate: function(date) {
            if (!date) return '';
            var d = date.getDate().toString().padStart(2, '0');
            var m = (date.getMonth() + 1).toString().padStart(2, '0');
            var y = date.getFullYear();
            var h = date.getHours().toString().padStart(2, '0');
            var min = date.getMinutes().toString().padStart(2, '0');
            return d + '.' + m + '.' + y + ' ' + h + ':' + min;
        }
    },
    
    // Routes
    routes: routes,
    
    // Events
    on: {
        init: function() {
            console.log('DashCam App initialized');
            
            // Check connection on start
            var self = this;
            self.methods.checkConnection();
            
            // Start periodic connection check
            startConnectionPolling();
        }
    }
});

// Create main view
var mainView = app.views.create('.view-main', {
    url: '/'
});

/**
 * Open device WiFi settings
 */
function openWiFiSettings() {
 
    if (window.cordova) {
        // Use cordova-open-native-settings plugin
        if (window.cordova.plugins && window.cordova.plugins.settings) {
            window.cordova.plugins.settings.open('wifi', 
                function() {
                    console.log('WiFi settings opened successfully');
                },
                function(error) {
                    console.log('Failed to open WiFi settings:', error);
                    showManualWiFiInstructions();
                }
            );
        } 
        // Alternative: try direct Android intent
        else {
            try {
                window.open('intent:#Intent;action=android.settings.WIFI_SETTINGS;end', '_system');
            } catch (e) {
                console.log('Intent failed:', e);
                showManualWiFiInstructions();
            }
        }
    } else {
        // Web/browser fallback
        showManualWiFiInstructions();
    }
}

/**
 * Show manual instructions if can't open WiFi settings
 */
function showManualWiFiInstructions() {
    app.dialog.alert(
        'Please open your device Settings → WiFi and connect to the dashcam network (usually starts with "DASHCAM" or similar).',
        'Connect to WiFi'
    );
}

/**
 * Start polling for connection
 * Checks every 3 seconds if connected to dashcam
 */
function startConnectionPolling() {
    // Clear existing interval
    if (connectionCheckInterval) {
        clearInterval(connectionCheckInterval);
    }
    
    // Check every 3 seconds
    connectionCheckInterval = setInterval(function() {
        app.methods.checkConnection().then(function(connected) {
            if (connected) {
                console.log('Dashcam connection detected');
            }
        });
    }, 3000);
}

/**
 * Stop connection polling
 */
function stopConnectionPolling() {
    if (connectionCheckInterval) {
        clearInterval(connectionCheckInterval);
        connectionCheckInterval = null;
    }
}

// Handle app pause/resume
document.addEventListener('pause', function() {
    stopConnectionPolling();
}, false);

document.addEventListener('resume', function() {
    startConnectionPolling();
    app.methods.checkConnection();
}, false);

// Export functions for use in templates
window.openWiFiSettings = openWiFiSettings;
window.showManualWiFiInstructions = showManualWiFiInstructions;
window.startConnectionPolling = startConnectionPolling;
window.stopConnectionPolling = stopConnectionPolling;