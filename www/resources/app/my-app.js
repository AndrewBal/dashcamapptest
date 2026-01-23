/**
 * DashCam App
 * Main application file
 */

// Initialize store
AppStore.init();

// Create Framework7 App instance
const app = new Framework7({
    el: '#app',
    name: 'DashCam',
    id: 'com.dashcam.app',
    theme: 'auto',
    
    // Panel settings
    panel: {
        swipe: true,
    },
    
    // Routes
    routes: routes,
    
    // App callbacks
    on: {
        init: function() {
            console.log('DashCam App initialized');
            checkCameraConnection();
        }
    }
});

// Create main view
const mainView = app.views.create('.view-main', {
    url: '/'
});

/**
 * Check camera connection
 */
async function checkCameraConnection() {
    try {
        const isConnected = await DashCamAPI.checkConnection();
        AppStore.setConnected(isConnected);
        
        if (isConnected) {
            await AppStore.updateFileCounts();
        }
    } catch (e) {
        console.error('Connection check failed:', e);
        AppStore.setConnected(false);
    }
}

/**
 * Connect to camera
 */
async function connectToCamera() {
    const dialog = app.dialog.preloader('Connecting...');
    
    try {
        const isConnected = await DashCamAPI.checkConnection();
        dialog.close();
        
        if (isConnected) {
            AppStore.setConnected(true);
            await AppStore.updateFileCounts();
            app.toast.show({
                text: 'Connected to dashcam!',
                position: 'center',
                closeTimeout: 2000
            });
            return true;
        } else {
            showConnectionError();
            return false;
        }
    } catch (e) {
        dialog.close();
        showConnectionError();
        return false;
    }
}

/**
 * Show connection error
 */
function showConnectionError() {
    app.dialog.alert(
        'Unable to connect to dashcam. Please make sure you are connected to the dashcam WiFi network.',
        'Connection Failed'
    );
}

/**
 * Take a photo
 */
async function takePhoto() {
    if (!AppStore.state.isConnected) {
        showNotConnectedPopup();
        return;
    }
    
    const dialog = app.dialog.preloader('Taking photo...');
    
    try {
        await DashCamAPI.takePhoto();
        dialog.close();
        
        app.toast.show({
            text: 'Photo captured!',
            position: 'center',
            closeTimeout: 2000
        });
    } catch (e) {
        dialog.close();
        app.toast.show({
            text: 'Failed to take photo',
            position: 'center',
            closeTimeout: 2000
        });
    }
}

/**
 * Toggle recording
 */
async function toggleRecording() {
    if (!AppStore.state.isConnected) {
        showNotConnectedPopup();
        return;
    }
    
    try {
        if (AppStore.state.isRecording) {
            await DashCamAPI.stopRecording();
            AppStore.setRecording(false);
            app.toast.show({
                text: 'Recording stopped',
                position: 'center',
                closeTimeout: 2000
            });
        } else {
            await DashCamAPI.startRecording();
            AppStore.setRecording(true);
            app.toast.show({
                text: 'Recording started',
                position: 'center',
                closeTimeout: 2000
            });
        }
    } catch (e) {
        app.toast.show({
            text: 'Failed to toggle recording',
            position: 'center',
            closeTimeout: 2000
        });
    }
}

/**
 * Open live stream
 */
function openLiveStream() {
    if (!AppStore.state.isConnected) {
        showNotConnectedPopup();
        return;
    }
    
    mainView.router.navigate('/live/');
}

/**
 * Show "Not Connected" popup
 */
function showNotConnectedPopup() {
    app.dialog.confirm(
        'Please connect to your dashcam WiFi first.',
        'Not Connected',
        function() {
            // Open WiFi settings (for native apps)
            if (typeof cordova !== 'undefined' && cordova.plugins && cordova.plugins.settings) {
                cordova.plugins.settings.openSetting('wifi');
            }
        }
    );
}

/**
 * Open camera selector sheet
 */
function openCameraSelector() {
    const cameras = AppStore.state.cameras;
    
    if (cameras.length === 0) {
        app.dialog.confirm(
            'No cameras added. Would you like to add one?',
            'Add Camera',
            function() {
                mainView.router.navigate('/add-camera/');
            }
        );
        return;
    }
    
    const buttons = cameras.map(camera => ({
        text: camera.name,
        onClick: function() {
            AppStore.selectCamera(camera);
            checkCameraConnection();
        }
    }));
    
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
    
    app.actions.create({
        buttons: [buttons]
    }).open();
}

/**
 * Format date for display
 */
function formatDate(date) {
    if (!date) return '';
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
}

/**
 * Format file size
 */
function formatFileSize(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Export functions globally
window.connectToCamera = connectToCamera;
window.takePhoto = takePhoto;
window.toggleRecording = toggleRecording;
window.openLiveStream = openLiveStream;
window.openCameraSelector = openCameraSelector;
window.checkCameraConnection = checkCameraConnection;
window.formatDate = formatDate;
window.formatFileSize = formatFileSize;
window.app = app;
window.mainView = mainView;
