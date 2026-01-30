var routes = [
    {
        path: '/panel-left/',
        panel: {
            componentUrl: './resources/pages/panel-left.html',
        },
        name: 'panel-left'
    },
    {
        path: '/',
        componentUrl: './resources/pages/home.html',
        name: 'home',
        options: {
            transition: 'f7-cover',
        },
    },
    {
        path: '/live/',
        componentUrl: './resources/pages/live.html',
        name: 'live',
        options: {
            transition: 'f7-cover',
        },
    },
    {
        path: '/gallery/',
        componentUrl: './resources/pages/gallery.html',
        name: 'gallery',
        options: {
            transition: 'f7-cover',
        },
    },
    {
        path: '/viewer/:type/:filename/',
        componentUrl: './resources/pages/viewer.html',
        name: 'viewer',
        options: {
            transition: 'f7-cover',
        },
    },
    {
        path: '/settings/',
        componentUrl: './resources/pages/settings.html',
        name: 'settings',
        options: {
            transition: 'f7-cover',
        },
    },
    {
        path: '/add-camera/',
        componentUrl: './resources/pages/add-camera.html',
        name: 'add-camera',
        options: {
            transition: 'f7-cover-v',
        },
    },
    {
        path: '/camera-settings/',
        componentUrl: './resources/pages/camera-settings.html',
        name: 'camera-settings',
        options: {
            transition: 'f7-cover',
        },
    },
    {
        path: '/info/',
        componentUrl: './resources/pages/info.html',
        name: 'info',
        options: {
            transition: 'f7-cover',
        },
    },
    // 404
    {
        path: '(.*)',
        url: './resources/pages/404.html',
    },
];
