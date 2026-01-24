/**
 * DashCam API Module
 * Camera IP: 192.168.0.1
 * Ports: TCP 80 (HTTP), TCP 554 (RTSP)
 */

window.DASHCAM_API = {
    // Base configuration
    config: {
        ip: '192.168.0.1',
        httpPort: 80,
        rtspPort: 554
    },

    // URLs
    get baseUrl() {
        return 'http://' + this.config.ip;
    },

    // RTSP streams
    streams: {
        front: function() {
            return 'rtsp://' + DASHCAM_API.config.ip + ':' + DASHCAM_API.config.rtspPort + '/livestream/1';
        },
        rear: function() {
            return 'rtsp://' + DASHCAM_API.config.ip + ':' + DASHCAM_API.config.rtspPort + '/livestream/2';
        }
    },

    // Directories
    directories: {
        lockedFront: 'emr',
        lockedRear: 'back_emr',
        loopFront: 'norm',
        loopRear: 'back_norm',
        snapshotFront: 'photo',
        snapshotRear: 'back_photo'
    },

    /**
     * Check connection to camera
     * Tries multiple methods to verify connection
     */
    checkConnection: function() {
        var self = this;
        return new Promise(function(resolve, reject) {
            var url = self.baseUrl + '/cgi-bin/hisnet/getdirfilecount.cgi?-dir=norm';
            
            console.log('[DashCam API] Checking connection to: ' + url);
            
            var xhr = new XMLHttpRequest();
            xhr.timeout = 5000; // Increased timeout to 5 seconds
            
            xhr.onreadystatechange = function() {
                if (xhr.readyState === 4) {
                    console.log('[DashCam API] Response status: ' + xhr.status);
                    console.log('[DashCam API] Response text: ' + xhr.responseText.substring(0, 100));
                    
                    // Check if we got any response (even if not 200)
                    // Some cameras return different status codes
                    if (xhr.status === 200 || xhr.status === 0 && xhr.responseText) {
                        // Check if response contains expected data
                        if (xhr.responseText && xhr.responseText.indexOf('count') !== -1) {
                            console.log('[DashCam API] Connection SUCCESS (valid response)');
                            resolve(true);
                        } else if (xhr.status === 200) {
                            console.log('[DashCam API] Connection SUCCESS (status 200)');
                            resolve(true);
                        } else {
                            console.log('[DashCam API] Connection FAILED (invalid response)');
                            resolve(false);
                        }
                    } else {
                        console.log('[DashCam API] Connection FAILED (status: ' + xhr.status + ')');
                        resolve(false);
                    }
                }
            };
            
            xhr.onerror = function(e) {
                console.log('[DashCam API] Connection ERROR: ', e);
                // Try alternative check
                self.checkConnectionAlternative().then(resolve);
            };
            
            xhr.ontimeout = function() {
                console.log('[DashCam API] Connection TIMEOUT');
                // Try alternative check
                self.checkConnectionAlternative().then(resolve);
            };
            
            try {
                xhr.open('GET', url, true);
                xhr.send();
            } catch (e) {
                console.log('[DashCam API] XHR Exception: ', e);
                self.checkConnectionAlternative().then(resolve);
            }
        });
    },

    /**
     * Alternative connection check using fetch API
     */
    checkConnectionAlternative: function() {
        var self = this;
        var url = self.baseUrl + '/';
        
        console.log('[DashCam API] Trying alternative check: ' + url);
        
        return new Promise(function(resolve) {
            if (typeof fetch !== 'undefined') {
                fetch(url, { 
                    method: 'GET',
                    mode: 'no-cors', // This allows the request but we can't read response
                    cache: 'no-cache'
                })
                .then(function(response) {
                    // With no-cors, response.type will be 'opaque' and we can't read status
                    // But if we get here without error, connection likely exists
                    console.log('[DashCam API] Fetch response type: ' + response.type);
                    resolve(true);
                })
                .catch(function(error) {
                    console.log('[DashCam API] Fetch error: ', error);
                    resolve(false);
                });
            } else {
                resolve(false);
            }
        });
    },

    /**
     * Simple ping check - just tries to reach the IP
     */
    pingCheck: function() {
        var self = this;
        return new Promise(function(resolve) {
            var img = new Image();
            var timeout;
            
            img.onload = function() {
                clearTimeout(timeout);
                console.log('[DashCam API] Ping SUCCESS');
                resolve(true);
            };
            
            img.onerror = function() {
                clearTimeout(timeout);
                // Error could mean server exists but no image - still connected
                console.log('[DashCam API] Ping error (might still be connected)');
                resolve(true); // Assume connected if we get error response
            };
            
            timeout = setTimeout(function() {
                console.log('[DashCam API] Ping TIMEOUT');
                resolve(false);
            }, 3000);
            
            // Try to load a small resource
            img.src = self.baseUrl + '/favicon.ico?' + Date.now();
        });
    },

    /**
     * Take photo (trigger)
     */
    takePhoto: function() {
        var self = this;
        return new Promise(function(resolve, reject) {
            var xhr = new XMLHttpRequest();
            xhr.onreadystatechange = function() {
                if (xhr.readyState === 4) {
                    resolve(xhr.responseText.indexOf('Success') !== -1 || xhr.status === 200);
                }
            };
            xhr.onerror = function() { reject('Request failed'); };
            xhr.open('GET', self.baseUrl + '/cgi-bin/hisnet/workmodecmd.cgi?-cmd=trigger', true);
            xhr.send();
        });
    },

    /**
     * Start recording
     */
    startRecording: function() {
        var self = this;
        return new Promise(function(resolve, reject) {
            var xhr = new XMLHttpRequest();
            xhr.onreadystatechange = function() {
                if (xhr.readyState === 4) {
                    resolve(xhr.responseText.indexOf('Success') !== -1 || xhr.status === 200);
                }
            };
            xhr.onerror = function() { reject('Request failed'); };
            xhr.open('GET', self.baseUrl + '/cgi-bin/hisnet/workmodecmd.cgi?-cmd=start', true);
            xhr.send();
        });
    },

    /**
     * Stop recording
     */
    stopRecording: function() {
        var self = this;
        return new Promise(function(resolve, reject) {
            var xhr = new XMLHttpRequest();
            xhr.onreadystatechange = function() {
                if (xhr.readyState === 4) {
                    resolve(xhr.responseText.indexOf('Success') !== -1 || xhr.status === 200);
                }
            };
            xhr.onerror = function() { reject('Request failed'); };
            xhr.open('GET', self.baseUrl + '/cgi-bin/hisnet/workmodecmd.cgi?-cmd=stop', true);
            xhr.send();
        });
    },

    /**
     * Get file count
     */
    getFileCount: function(dir) {
        var self = this;
        return new Promise(function(resolve, reject) {
            var xhr = new XMLHttpRequest();
            xhr.onreadystatechange = function() {
                if (xhr.readyState === 4) {
                    var match = xhr.responseText.match(/count=(\d+)/);
                    resolve(match ? parseInt(match[1], 10) : 0);
                }
            };
            xhr.onerror = function() { resolve(0); };
            xhr.open('GET', self.baseUrl + '/cgi-bin/hisnet/getdirfilecount.cgi?-dir=' + dir, true);
            xhr.send();
        });
    },

    /**
     * Get file list
     */
    getFileList: function(dir, start, end) {
        var self = this;
        start = start || 0;
        end = end || 50;
        
        return new Promise(function(resolve, reject) {
            var xhr = new XMLHttpRequest();
            xhr.onreadystatechange = function() {
                if (xhr.readyState === 4) {
                    resolve(self.parseFileList(xhr.responseText, dir));
                }
            };
            xhr.onerror = function() { resolve([]); };
            xhr.open('GET', self.baseUrl + '/cgi-bin/hisnet/getdirfilelist.cgi?-dir=' + dir + '&-start=' + start + '&-end=' + end, true);
            xhr.send();
        });
    },

    /**
     * Parse file list response
     */
    parseFileList: function(response, dir) {
        var files = [];
        var lines = response.split('\n');
        var self = this;
        
        for (var i = 0; i < lines.length; i++) {
            var line = lines[i].trim();
            if (line && line.indexOf('count=') === -1) {
                var match = line.match(/filename=([^\s&]+)/);
                if (match) {
                    var filename = match[1];
                    files.push({
                        filename: filename,
                        dir: dir,
                        url: self.getFileUrl(dir, filename),
                        thumbnailUrl: self.getThumbnailUrl(dir, filename),
                        dateTime: self.parseDateTime(filename)
                    });
                }
            }
        }
        
        return files;
    },

    /**
     * Parse date/time from filename
     * Format: 2026_01_20_151021_00.TS
     */
    parseDateTime: function(filename) {
        var match = filename.match(/(\d{4})_(\d{2})_(\d{2})_(\d{2})(\d{2})(\d{2})/);
        if (match) {
            return new Date(match[1], parseInt(match[2]) - 1, match[3], match[4], match[5], match[6]);
        }
        return null;
    },

    /**
     * Get file URL
     */
    getFileUrl: function(dir, filename) {
        return this.baseUrl + '/sd//' + dir + '/' + filename;
    },

    /**
     * Get thumbnail URL
     */
    getThumbnailUrl: function(dir, filename) {
        var thumbName = filename.replace(/\.(TS|ts)$/, '.THM');
        return this.baseUrl + '/sd//' + dir + '/' + thumbName;
    },

    /**
     * Get gallery files
     */
    getGalleryFiles: function(type, camera) {
        camera = camera || 'front';
        var dir;
        
        if (type === 'loop') {
            dir = camera === 'front' ? this.directories.loopFront : this.directories.loopRear;
        } else if (type === 'locked') {
            dir = camera === 'front' ? this.directories.lockedFront : this.directories.lockedRear;
        } else if (type === 'snapshot') {
            dir = camera === 'front' ? this.directories.snapshotFront : this.directories.snapshotRear;
        }
        
        return this.getFileList(dir);
    }
};

// Alias for compatibility
window.DashCamAPI = window.DASHCAM_API;