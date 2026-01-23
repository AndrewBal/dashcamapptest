/**
 * DashCam App
 * Main application file
 */

// Initialize store
AppStore.init();

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
                AppStore.setConnected(connected);
                self.data.isConnected = connected;
                return connected;
            });
        },
        
        // Connect to camera
        connectToCamera: function() {
            var self = this;
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
                    self.dialog.alert(
                        'Unable to connect. Please check WiFi connection.',
                        'Connection Failed'
                    );
                    return false;
                }
            }).catch(function() {
                self.preloader.hide();
                self.dialog.alert(
                    'Connection error. Please try again.',
                    'Error'
                );
                return false;
            });
        },
        
        // Take photo
        takePhoto: function() {
            var self = this;
            
            if (!AppStore.state.isConnected) {
                self.dialog.alert('Please connect to camera first', 'Not Connected');
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
                self.dialog.alert('Please connect to camera first', 'Not Connected');
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
            
            if (!AppStore.state.isConnected) {
                self.dialog.confirm(
                    'Please connect to camera first. Open WiFi settings?',
                    'Not Connected',
                    function() {
                        // Try to open WiFi settings on mobile
                        if (window.cordova && cordova.plugins && cordova.plugins.settings) {
                            cordova.plugins.settings.openSetting('wifi');
                        }
                    }
                );
                return;
            }
            
            mainView.router.navigate('/live/');
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
            if (AppStore.state.selectedCamera) {
                self.methods.checkConnection();
            }
        }
    }
});

// Create main view
var mainView = app.views.create('.view-main', {
    url: '/'
});
