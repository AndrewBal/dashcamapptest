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
     */
    checkConnection: function() {
        var self = this;
        return new Promise(function(resolve, reject) {
            var xhr = new XMLHttpRequest();
            xhr.timeout = 3000;
            xhr.onreadystatechange = function() {
                if (xhr.readyState === 4) {
                    resolve(xhr.status === 200);
                }
            };
            xhr.onerror = function() { resolve(false); };
            xhr.ontimeout = function() { resolve(false); };
            xhr.open('GET', self.baseUrl + '/cgi-bin/hisnet/getdirfilecount.cgi?-dir=norm', true);
            xhr.send();
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
                    resolve(xhr.responseText.indexOf('Success') !== -1);
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
                    resolve(xhr.responseText.indexOf('Success') !== -1);
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
                    resolve(xhr.responseText.indexOf('Success') !== -1);
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
