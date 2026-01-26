/**
 * DashCam API Module
 * Camera IP: 192.168.0.1
 * Ports: TCP 80 (HTTP), TCP 554 (RTSP)
 * 
 * Response formats:
 * - File list: sd//norm/2026_01_24_115023_00.TS;sd//norm/2026_01_24_114922_01.TS;
 * - File count: var count="44";
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
     */
    checkConnection: function() {
        var self = this;
        return new Promise(function(resolve, reject) {
            var url = self.baseUrl + '/cgi-bin/hisnet/getdirfilecount.cgi?&-dir=norm';
            
            console.log('[DashCam API] Checking connection to: ' + url);
            
            var xhr = new XMLHttpRequest();
            xhr.timeout = 5000;
            
            xhr.onreadystatechange = function() {
                if (xhr.readyState === 4) {
                    console.log('[DashCam API] Response status: ' + xhr.status);
                    console.log('[DashCam API] Response text: ' + xhr.responseText);
                    
                    if (xhr.status === 200) {
                        // Check for var count="X"; format
                        if (xhr.responseText && xhr.responseText.indexOf('count=') !== -1) {
                            console.log('[DashCam API] Connection SUCCESS');
                            resolve(true);
                        } else {
                            console.log('[DashCam API] Connection SUCCESS (status 200)');
                            resolve(true);
                        }
                    } else {
                        console.log('[DashCam API] Connection FAILED');
                        resolve(false);
                    }
                }
            };
            
            xhr.onerror = function(e) {
                console.log('[DashCam API] Connection ERROR: ', e);
                resolve(false);
            };
            
            xhr.ontimeout = function() {
                console.log('[DashCam API] Connection TIMEOUT');
                resolve(false);
            };
            
            try {
                xhr.open('GET', url, true);
                xhr.send();
            } catch (e) {
                console.log('[DashCam API] XHR Exception: ', e);
                resolve(false);
            }
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
                    resolve(xhr.status === 200);
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
            var url = self.baseUrl + '/cgi-bin/hisnet/workmodecmd.cgi?-cmd=start';
            console.log('[DashCam API] Start recording: ' + url);
            
            var xhr = new XMLHttpRequest();
            xhr.onreadystatechange = function() {
                if (xhr.readyState === 4) {
                    console.log('[DashCam API] Start recording response: ' + xhr.responseText);
                    resolve(xhr.status === 200);
                }
            };
            xhr.onerror = function() { reject('Request failed'); };
            xhr.open('GET', url, true);
            xhr.send();
        });
    },

    /**
     * Stop recording
     */
    stopRecording: function() {
        var self = this;
        return new Promise(function(resolve, reject) {
            var url = self.baseUrl + '/cgi-bin/hisnet/workmodecmd.cgi?-cmd=stop';
            console.log('[DashCam API] Stop recording: ' + url);
            
            var xhr = new XMLHttpRequest();
            xhr.timeout = 5000;
            
            xhr.onreadystatechange = function() {
                if (xhr.readyState === 4) {
                    console.log('[DashCam API] Stop recording response: ' + xhr.responseText);
                    resolve(xhr.status === 200);
                }
            };
            xhr.onerror = function(e) { 
                console.log('[DashCam API] Stop recording error:', e);
                reject('Request failed'); 
            };
            xhr.ontimeout = function() {
                console.log('[DashCam API] Stop recording timeout');
                resolve(true);
            };
            xhr.open('GET', url, true);
            xhr.send();
        });
    },

    /**
     * Get file count
     * Response format: var count="44";
     */
    getFileCount: function(dir) {
        var self = this;
        return new Promise(function(resolve, reject) {
            var url = self.baseUrl + '/cgi-bin/hisnet/getdirfilecount.cgi?&-dir=' + dir;
            console.log('[DashCam API] Get file count: ' + url);
            
            var xhr = new XMLHttpRequest();
            xhr.timeout = 5000;
            
            xhr.onreadystatechange = function() {
                if (xhr.readyState === 4) {
                    console.log('[DashCam API] File count response for ' + dir + ': ' + xhr.responseText);
                    
                    // Parse: var count="44";
                    var match = xhr.responseText.match(/count="?(\d+)"?/);
                    var count = match ? parseInt(match[1], 10) : 0;
                    console.log('[DashCam API] Parsed count: ' + count);
                    resolve(count);
                }
            };
            xhr.onerror = function(e) { 
                console.log('[DashCam API] File count error:', e);
                resolve(0); 
            };
            xhr.ontimeout = function() {
                console.log('[DashCam API] File count timeout');
                resolve(0);
            };
            xhr.open('GET', url, true);
            xhr.send();
        });
    },

    /**
     * Get file list
     * Response format: sd//norm/2026_01_24_115023_00.TS;sd//norm/2026_01_24_114922_01.TS;
     */
    getFileList: function(dir, start, end) {
        var self = this;
        start = start || 0;
        end = end || 50;
        
        return new Promise(function(resolve, reject) {
            var url = self.baseUrl + '/cgi-bin/hisnet/getdirfilelist.cgi?&-dir=' + dir + '&-start=' + start + '&-end=' + end;
            console.log('[DashCam API] Get file list: ' + url);
            
            var xhr = new XMLHttpRequest();
            xhr.timeout = 10000;
            
            xhr.onreadystatechange = function() {
                if (xhr.readyState === 4) {
                    console.log('[DashCam API] File list raw response for ' + dir + ':', xhr.responseText);
                    var files = self.parseFileList(xhr.responseText, dir);
                    console.log('[DashCam API] Parsed ' + files.length + ' files');
                    resolve(files);
                }
            };
            xhr.onerror = function(e) { 
                console.log('[DashCam API] File list error:', e);
                resolve([]); 
            };
            xhr.ontimeout = function() {
                console.log('[DashCam API] File list timeout');
                resolve([]);
            };
            xhr.open('GET', url, true);
            xhr.send();
        });
    },

    /**
     * Parse file list response
     * Input format: sd//norm/2026_01_24_115023_00.TS;sd//norm/2026_01_24_114922_01.TS;
     * Files are separated by semicolon (;)
     */
    parseFileList: function(response, dir) {
        var files = [];
        var self = this;
        
        if (!response || response.trim() === '') {
            console.log('[DashCam API] Empty response for parseFileList');
            return files;
        }
        
        // Split by semicolon
        var entries = response.split(';');
        console.log('[DashCam API] Split into ' + entries.length + ' entries');
        
        for (var i = 0; i < entries.length; i++) {
            var entry = entries[i].trim();
            
            // Skip empty entries
            if (!entry) continue;
            
            // Entry format: sd//norm/2026_01_24_115023_00.TS
            // Extract filename from path
            var parts = entry.split('/');
            var filename = parts[parts.length - 1]; // Get last part (filename)
            
            if (filename && (filename.indexOf('.TS') !== -1 || filename.indexOf('.JPG') !== -1 || 
                            filename.indexOf('.ts') !== -1 || filename.indexOf('.jpg') !== -1)) {
                
                var fileObj = {
                    filename: filename,
                    dir: dir,
                    path: entry, // Full path from response: sd//norm/2026_01_24_115023_00.TS
                    url: self.baseUrl + '/' + entry, // http://192.168.0.1/sd//norm/2026_01_24_115023_00.TS
                    thumbnailUrl: self.getThumbnailUrl(entry, filename),
                    dateTime: self.parseDateTime(filename)
                };
                
                console.log('[DashCam API] Parsed file:', filename, fileObj.url);
                files.push(fileObj);
            }
        }
        
        return files;
    },

    /**
     * Parse date/time from filename
     * Format: 2026_01_24_115023_00.TS or 2026_01_24_115023_00_b.TS (rear)
     */
    parseDateTime: function(filename) {
        var match = filename.match(/(\d{4})_(\d{2})_(\d{2})_(\d{2})(\d{2})(\d{2})/);
        if (match) {
            return new Date(
                parseInt(match[1], 10),      // year
                parseInt(match[2], 10) - 1,  // month (0-indexed)
                parseInt(match[3], 10),      // day
                parseInt(match[4], 10),      // hour
                parseInt(match[5], 10),      // minute
                parseInt(match[6], 10)       // second
            );
        }
        return null;
    },

    /**
     * Get thumbnail URL
     * @param {string} path - Full path from response: sd//norm/2026_01_24_115023_00.TS
     * @param {string} filename - Just filename: 2026_01_24_115023_00.TS
     */
    getThumbnailUrl: function(path, filename) {
        // For photos (JPG) - use same URL
        if (filename.toUpperCase().indexOf('.JPG') !== -1) {
            return this.baseUrl + '/' + path;
        }
        
        // For videos - replace .TS with .THM
        var thumbPath = path.replace(/\.(TS|ts)$/i, '.THM');
        return this.baseUrl + '/' + thumbPath;
    },

    /**
     * Get gallery files by type and camera
     * @param {string} type - 'loop', 'locked', or 'snapshot'
     * @param {string} camera - 'front' or 'rear'
     */
    getGalleryFiles: function(type, camera) {
        var self = this;
        camera = camera || 'front';
        var dir;
        
        if (type === 'loop') {
            dir = camera === 'front' ? this.directories.loopFront : this.directories.loopRear;
        } else if (type === 'locked') {
            dir = camera === 'front' ? this.directories.lockedFront : this.directories.lockedRear;
        } else if (type === 'snapshot') {
            dir = camera === 'front' ? this.directories.snapshotFront : this.directories.snapshotRear;
        }
        
        console.log('[DashCam API] getGalleryFiles type=' + type + ', camera=' + camera + ', dir=' + dir);
        
        if (!dir) {
            console.log('[DashCam API] Invalid type or camera');
            return Promise.resolve([]);
        }
        
        return this.getFileList(dir);
    },

    /**
     * Get all file counts
     */
    getAllFileCounts: function() {
        var self = this;
        return Promise.all([
            self.getFileCount(self.directories.loopFront),
            self.getFileCount(self.directories.loopRear),
            self.getFileCount(self.directories.lockedFront),
            self.getFileCount(self.directories.lockedRear),
            self.getFileCount(self.directories.snapshotFront),
            self.getFileCount(self.directories.snapshotRear)
        ]).then(function(counts) {
            return {
                loop: counts[0] + counts[1],
                loopFront: counts[0],
                loopRear: counts[1],
                locked: counts[2] + counts[3],
                lockedFront: counts[2],
                lockedRear: counts[3],
                snapshot: counts[4] + counts[5],
                snapshotFront: counts[4],
                snapshotRear: counts[5]
            };
        });
    }
};

// Alias for compatibility
window.DashCamAPI = window.DASHCAM_API;