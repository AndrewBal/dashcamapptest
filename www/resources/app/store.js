/**
 * DashCam Store Module
 */

window.AppStore = {
    state: {
        isConnected: false,
        isRecording: false,
        currentCamera: 'front',
        cameras: [],
        selectedCamera: null
    },

    init: function() {
        this.loadFromStorage();
    },

    loadFromStorage: function() {
        try {
            var cameras = localStorage.getItem('dashcam_cameras');
            if (cameras) {
                this.state.cameras = JSON.parse(cameras);
            }
            
            var selectedCamera = localStorage.getItem('dashcam_selected');
            if (selectedCamera) {
                this.state.selectedCamera = JSON.parse(selectedCamera);
                if (this.state.selectedCamera) {
                    DASHCAM_API.config.ip = this.state.selectedCamera.ip;
                }
            }
        } catch (e) {
            console.error('Failed to load from storage:', e);
        }
    },

    saveCameras: function() {
        try {
            localStorage.setItem('dashcam_cameras', JSON.stringify(this.state.cameras));
        } catch (e) {
            console.error('Failed to save cameras:', e);
        }
    },

    saveSelectedCamera: function() {
        try {
            localStorage.setItem('dashcam_selected', JSON.stringify(this.state.selectedCamera));
        } catch (e) {
            console.error('Failed to save selected camera:', e);
        }
    },

    addCamera: function(camera) {
        var newCamera = {
            id: Date.now(),
            name: camera.name || 'DashCam ' + (this.state.cameras.length + 1),
            ip: camera.ip || '192.168.0.1',
            ssid: camera.ssid || ''
        };
        
        this.state.cameras.push(newCamera);
        this.saveCameras();
        
        return newCamera;
    },

    removeCamera: function(id) {
        this.state.cameras = this.state.cameras.filter(function(c) {
            return c.id !== id;
        });
        this.saveCameras();
        
        if (this.state.selectedCamera && this.state.selectedCamera.id === id) {
            this.state.selectedCamera = null;
            this.state.isConnected = false;
            this.saveSelectedCamera();
        }
    },

    selectCamera: function(camera) {
        this.state.selectedCamera = camera;
        if (camera) {
            DASHCAM_API.config.ip = camera.ip;
        }
        this.saveSelectedCamera();
    },

    setConnected: function(status) {
        this.state.isConnected = status;
    },

    setRecording: function(status) {
        this.state.isRecording = status;
    },

    switchCamera: function() {
        this.state.currentCamera = this.state.currentCamera === 'front' ? 'rear' : 'front';
        return this.state.currentCamera;
    },

    getCurrentStreamUrl: function() {
        return this.state.currentCamera === 'front' 
            ? DASHCAM_API.streams.front() 
            : DASHCAM_API.streams.rear();
    }
};
