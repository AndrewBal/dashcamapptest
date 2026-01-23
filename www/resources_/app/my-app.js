var $$ = Dom7;



// API ADRESS URL
//const LOCAL_ADRESS = 'http://192.168.1.1/';
const LOCAL_ADRESS = 'http://192.168.0.1';
const API_COMMON_VIDEO_LIST = LOCAL_ADRESS + 'ini.htm?cmd=commonvideolist';
const API_ALARM_VIDEO_LIST = LOCAL_ADRESS + 'ini.htm?cmd=alarmvideolist';
const API_GET_GPS_POSITION = LOCAL_ADRESS + 'ini.htm?cmd=gpsdatalist';
//const API_LIVE_STREAM = LOCAL_ADRESS + 'livesubstream.h264';
const API_LIVE_STREAM = 'rtsp://192.168.0.1:554/livestream/1';
const API_DOWNLOAD = LOCAL_ADRESS + 'DCIM/';





var MapTrack = null;
window.PosMarker = {};
var App = new Framework7({
    swipeBackPage: false,
    material: true,
    allowDuplicateUrls: true,
    sortable: false,
    precompileTemplates: true,
    template7Pages: true,
    tapHold: false, //enable tap hold events
    root: '#app',
    name: 'DashCam',
    id: 'com.myapp.test',
    panel: {
        swipe: 'left',
        leftBreakpoint: 768,
    },
    routes: routes,
    on: {
        init: function () {
            // console.log('App initialized');

        },
        pageInit: function () {
            // console.log('Page initialized');
        },
    },
});

var mainView = App.views.create('.view-main');


$$('#connectCam').on('click', function () {


});


document.addEventListener('deviceready', function () {
    $$('#testLive').on('click', function (e) {
      

            var url = 'rtsp://192.168.0.1:554/livestream/1';

            window.RtspPlayer.play(url,
                function (status) {
                    console.log('Player status:', status);
                    // status can be: "PLAYING", "CLOSED"
                },
                function (error) {
                    console.error('Player error:', error);
                }
            );

  
    });
}, false);






$$('#mainMenu li').on('click', menuList)

function menuList() {
    let listId = $$(this).attr('id');
    let activePage = mainView.activePage;

    if (listId) {
        switch (listId) {
            case 'carcam':
                // if (typeof(activePage) == 'undefined' || (activePage && activePage.name != "delete.cam")) {
                //     loadCarcamPage();
                //     console.log('open cam');
                //     App.panel.close($$('.panel-left'), true);
                // }
                mainView.router.back({
                    pageName: 'home',
                    force: true
                });
                App.panel.close($$('.panel-left'), true);
                break;
            case 'delete.cam':
                if (typeof (activePage) == 'undefined' || (activePage && activePage.name != "delete.cam")) {
                    loadDeleteCamPage();
                    console.log('open del');
                    App.panel.close($$('.panel-left'), true);
                }
                break;
            case 'gallery':
                if (typeof (activePage) == 'undefined' || (activePage && activePage.name != "gallery")) {
                    loadGalleryPage();
                    App.panel.close($$('.panel-left'), true);
                }
                break;
            case 'info':
                if (typeof (activePage) == 'undefined' || (activePage && activePage.name != "info")) {
                    loadInfoPage();
                    App.panel.close($$('.panel-left'), true);
                }
                break;
            default:
                console.log('No Found list menu');
        }
    }
}




function getRecordInfo() {

    // тут типа должен быть аяк вызов который будет по апи тянуть джейсон строку

    // имитируем респонс ответ 
    let data = { "type": "commonvideo", "mp4folder": "DCIM/100video", "titlefolder": "DCIM/103thumb", "thumbfolder": "DCIM/102thumb", "mp4data": [{ "filename": "20190523121307_180_720p.MP4", "duration": 180, "filesize": 94716138, "title": "20190523121307.JPG", "titlesize": 5817, "thumb": "20190523121307.TGZ", "thumbsize": 36302, "time": "20190523121307" }, { "filename": "20190522183431_60_720p.MP4", "duration": 60, "filesize": 31524959, "title": "20190522183431.JPG", "titlesize": 4496, "thumb": "20190522183431.TGZ", "thumbsize": 8248, "time": "20190522183431" }, { "filename": "20190522183131_180_720p.MP4", "duration": 180, "filesize": 94784465, "title": "20190522183131.JPG", "titlesize": 4367, "thumb": "20190522183131.TGZ", "thumbsize": 33554, "time": "20190522183131" }, { "filename": "20190522182831_180_720p.MP4", "duration": 180, "filesize": 94735201, "title": "20190522182831.JPG", "titlesize": 4268, "thumb": "20190522182831.TGZ", "thumbsize": 32689, "time": "20190522182831" }, { "filename": "20190522182531_180_720p.MP4", "duration": 180, "filesize": 94748683, "title": "20190522182531.JPG", "titlesize": 4028, "thumb": "20190522182531.TGZ", "thumbsize": 31223, "time": "20190522182531" }, { "filename": "20190522182231_180_720p.MP4", "duration": 180, "filesize": 94810902, "title": "20190522182231.JPG", "titlesize": 4073, "thumb": "20190522182231.TGZ", "thumbsize": 31388, "time": "20190522182231" }, { "filename": "20190522181931_180_720p.MP4", "duration": 180, "filesize": 94752401, "title": "20190522181931.JPG", "titlesize": 4416, "thumb": "20190522181931.TGZ", "thumbsize": 32301, "time": "20190522181931" }, { "filename": "20190522181631_180_720p.MP4", "duration": 180, "filesize": 94713344, "title": "20190522181631.JPG", "titlesize": 4459, "thumb": "20190522181631.TGZ", "thumbsize": 34450, "time": "20190522181631" }, { "filename": "20190522181331_180_720p.MP4", "duration": 180, "filesize": 94814436, "title": "20190522181331.JPG", "titlesize": 4485, "thumb": "20190522181331.TGZ", "thumbsize": 34100, "time": "20190522181331" }, { "filename": "20190522181031_180_720p.MP4", "duration": 180, "filesize": 94742625, "title": "20190522181031.JPG", "titlesize": 4378, "thumb": "20190522181031.TGZ", "thumbsize": 34123, "time": "20190522181031" }] };


    console.log('axaj call');
    return data;

}


function loadCarcamPage() {
    mainView.router.load({
        url: 'index.html',
        context: {
            // FirstName: userInfo.FirstName,
        }
    });
}




// GALLERY
function loadGalleryPage() {
    mainView.router.load({
        url: 'resources/templates/gallery.html',
        context: {
            // FirstName: userInfo.FirstName,
        }
    });
}


// PHOTO GALLERY
function loadGalleryPhotoPage() {
    mainView.router.load({
        url: 'resources/templates/gallery.photo.html',
        context: {
            // FirstName: userInfo.FirstName,
        }
    });
}


// DASHCAM VIDEO
function loadDashcamVideoPage() {
    mainView.router.load({
        url: 'resources/templates/dashcam.video.html',
        context: {
            // FirstName: userInfo.FirstName,
        }
    });
}


function getDate(data) {
    let arr = [];
    let dateTime = [];
    // class date, time
    function Obj(dateArr, timeArr) {
        this.date = dateArr.substring(0, 4) + '/' + dateArr.substring(4, 6) + '/' + dateArr.substring(6, 9);
        this.time = timeArr.substring(0, 2) + '.' + timeArr.substring(2, 4) + '.' + timeArr.substring(4, 7);
    }

    // add in arr datetime 
    for (let i = 0; i < data.mp4data.length; i++) {
        arr.push(data.mp4data[i].time);
    }

    // add in arr object with date and time
    for (let i = 0; i < arr.length; i++) {
        let newDataTime = new Obj(arr[i].substring(0, 8), arr[i].substring(8, 14));
        dateTime.push(newDataTime);
    }

    return dateTime;
}


function sortDatePhoto(data) {
    let infoArr = [];
    let dataObj = data;
    let sortArr = [];
    // console.log(dataObj);

    // info array push
    for (let i = 0; i < dataObj.mp4data.length; i++) {
        infoArr.push({
            data: (dataObj.mp4data[i].time.substring(0, 8)).substring(0, 4) + '/' + (dataObj.mp4data[i].time.substring(0, 8)).substring(4, 6) + '/' + (dataObj.mp4data[i].time.substring(0, 8)).substring(6, 9),
            photoName: dataObj.mp4data[i].title
        });
    }
    console.log(infoArr);

    for (let i = 0; i < infoArr.length; i++) {
        if (infoArr[i] !== '') {
            if (sortArr.length == 0) {
                sortArr.push({
                    Date: infoArr[i].data,
                    Photo: infoArr[i].photoName
                });
            } else {
                // for (let p = 0; p < sortArr.length; p++) {
                //     if (sortArr[p].Date !== infoArr[i].data) {
                //         sortArr.push({
                //             Date: infoArr[i].data,
                //             Photo: infoArr[i].photoName
                //         });
                //     }

                // }
            }
        } else {
            App.dialog.alert('Not Found');
        }
    }

    console.log(sortArr);


}



$$(document).on('page:init', '.page[data-name="gallery"]', function (e) {
    let toolbarLinks = $$('.tab-link');
    let getPhotoJson = getRecordInfo();
    let videolist = [];
    let videoItems = [];
    let dateObj = getDate(getPhotoJson);
    sortDatePhoto(getPhotoJson)
    // console.log(dateObj);


    for (let i = 0; i < getPhotoJson.mp4data.length; i++) {
        videolist.push(getPhotoJson.mp4data[i].filename);
    }


    // console.log(date);
    for (let i = 0; i < videolist.length; i++) {
        videoItems.push({
            title: videolist[i],
            value: i,
            dateList: dateObj[i].date,
            timeList: dateObj[i].time,
            prevImg: getPhotoJson.mp4data[i].title,
            durationVideo: getPhotoJson.mp4data[i].duration,
            videoName: getPhotoJson.mp4data[i].filename,
        });
    }

    // console.log(videoItems);

    let loadVideoList = App.virtualList.create({
        el: '.video-list',
        items: videoItems,
        searchAll: function (query, items) {
            let found = [];
            for (let i = 0; i < items.length; i++) {
                if (items[i].title.toLowerCase().indexOf(query.toLowerCase()) >= 0 || query.trim() === '') found.push(i);
            }
            return found;
        },
        itemTemplate: '<li>' +
            '<div>{{dateList}}</div>' +
            '<a href="#" class="" data-video="{{videoName}}">' +
            '<div class="item-content">' +
            '<div class="item-media video-item-media">' +
            '<img src="resources/images/DCIM/103thumb/{{prevImg}}">' +
            '<div class="item-media-bottom">' +
            '<div class="item-media-quality">720p</div>' +
            '<div class="item-media-time">{{timeList}}</div>' +
            '</div>' +
            '</div>' +
            '</div>' +
            '</a>' +
            '</li>',
        height: app.theme === 'ios' ? 73 : (app.theme === 'md' ? 73 : 73),
    });



});


// var arr = [
//     {
//         date: '2019/03/24',
//         photo: [
//             {
//                 time: '12.13.07',
//                 name: '20190523121307.JPG',
//                 quality: '720p'
//             },
//             {
//                 time: '12.13.45',
//                 name: '20190523121345.JPG',
//                 quality: '360p'
//             }
//         ]
//     },
//     {
//         date: '2019/04/27',
//         photo: [
//             {
//                 time: '10.53.11',
//                 name: '2019052315311.JPG',
//                 quality: '120p'
//             }
//             {
//                 time: '03.13.07',
//                 name: '20190523031307.JPG',
//                 quality: '720p'
//             }
//         ]
//     },

// ]





// INIT VIDEO GALLERY

$$(document).on('page:init', '.page[data-name="gallery.video"]', function (e) {
    let toolbarLinks = $$('.tab-link');
    let getPhotoJson = getRecordInfo();
    let videolist = [];

    toolbarLinks.on('click', function () {
        let dataId = $$(this).attr('data-id');
        if (dataId == 'gallery.photo') {
            loadGalleryPhotoPage();
        }
    });


    for (let i = 0; i < getPhotoJson.mp4data.length; i++) {
        videolist.push(getPhotoJson.mp4data[i].filename);
    }


    let items = [];
    for (let i = 0; i < videolist.length; i++) {
        items.push({
            title: 'Dachcam name #' + videolist[i],
            value: videolist[i],
        });
    }

    console.log(items);

    let loadVideoList = App.virtualList.create({
        el: '.load-video-list',
        items: items,
        searchAll: function (query, items) {
            let found = [];
            for (let i = 0; i < items.length; i++) {
                if (items[i].title.toLowerCase().indexOf(query.toLowerCase()) >= 0 || query.trim() === '') found.push(i);
            }
            return found;
        },
        itemTemplate: '<li>' +
            '<label class="item-radio item-content">' +
            '<input type="radio" name="demo-radio" value="{{value}}"/>' +
            '<div class="item-media">' +
            '<div class="item-media-inner">' +
            '<p>DC</p>' +
            '</div>' +
            '</div>' +
            '<div class="item-inner">' +
            '<div class="item-title">{{title}}</div>' +
            '</div>' +
            '<i class="icon icon-radio"></i>' +
            '</label>' +
            '</li>',
        height: app.theme === 'ios' ? 73 : (app.theme === 'md' ? 73 : 73),
    });




});

function loadGalleryVideoPage() {
    mainView.router.load({
        url: 'resources/templates/gallery.video.html',
        context: {
            // FirstName: userInfo.FirstName,
        }
    });
}


function loadInfoPage() {
    mainView.router.load({
        url: 'resources/templates/info.html',
        context: {
            // FirstName: userInfo.FirstName,
        }
    });
}

function loadCarcamPage() {
    console.log('Carcam page');
}



// INIT DELETE CAM

$$(document).on('page:init', '.page[data-name="delete.cam"]', function (e) {

    var items = [];
    for (var i = 1; i <= 8; i++) {
        items.push({
            title: 'Item ' + i,
            value: i,
        });
    }

    var deletecamList = App.virtualList.create({
        // List Element
        el: '.delete-cam-list',
        // Pass array with items
        items: items,
        // Custom search function for searchbar
        searchAll: function (query, items) {
            var found = [];
            for (var i = 0; i < items.length; i++) {
                if (items[i].title.toLowerCase().indexOf(query.toLowerCase()) >= 0 || query.trim() === '') found.push(i);
            }
            return found; //return array with mathced indexes
        },
        // List item Template7 template
        itemTemplate: '<li>' +
            '<label class="item-checkbox item-content">' +
            '<input type="checkbox" name="demo-checkbox" value="{{value}}"/>' +
            '<div class="item-media">' +
            '<div class="item-media-inner">' +
            '<p>DC</p>' +
            '</div>' +
            '</div>' +
            '<div class="item-inner">' +
            '<div class="item-title">{{title}}</div>' +
            '</div>' +
            '<i class="icon icon-checkbox"></i>' +
            '</label>' +
            '</li>',
        // Item height
        height: app.theme === 'ios' ? 73 : (app.theme === 'md' ? 73 : 73),
    });
});


function loadDeleteCamPage() {
    mainView.router.load({
        url: 'resources/templates/delete.cam.html',
        context: {
            // FirstName: userInfo.FirstName,
        }
    });
}




// INIT OPEN PAGE DASHCAM LIST

$$(document).on('page:init', '.page[data-name="open.dashcam"]', function (e) {

    var items = [];
    for (var i = 1; i <= 3; i++) {
        items.push({
            title: 'Dachcam name #' + i,
            value: i,
        });
    }

    var deletecamList = App.virtualList.create({
        // List Element
        el: '.open-cam-list',
        // Pass array with items
        items: items,
        // Custom search function for searchbar
        searchAll: function (query, items) {
            var found = [];
            for (var i = 0; i < items.length; i++) {
                if (items[i].title.toLowerCase().indexOf(query.toLowerCase()) >= 0 || query.trim() === '') found.push(i);
            }
            return found; //return array with mathced indexes
        },
        // List item Template7 template
        itemTemplate: '<li>' +
            '<label class="item-radio item-content">' +
            '<input type="radio" name="demo-radio" value="{{value}}"/>' +
            '<div class="item-media">' +
            '<div class="item-media-inner">' +
            '<p>DC</p>' +
            '</div>' +
            '</div>' +
            '<div class="item-inner">' +
            '<div class="item-title">{{title}}</div>' +
            '</div>' +
            '<i class="icon icon-radio"></i>' +
            '</label>' +
            '</li>',
        // Item height
        height: app.theme === 'ios' ? 73 : (app.theme === 'md' ? 73 : 73),
    });
});




// INIT NORMAL VIDEO LIST PAGE

$$(document).on('page:init', '.page[data-name="normal.dashcam"]', function (e) {

    var items = [];
    for (var i = 1; i <= 3; i++) {
        items.push({
            title: 'Dachcam name #' + i,
            value: i,
        });
    }

    var showNormalVideoList = App.virtualList.create({
        // List Element
        el: '.show-normal-list',
        // Pass array with items
        items: items,
        // Custom search function for searchbar
        searchAll: function (query, items) {
            var found = [];
            for (var i = 0; i < items.length; i++) {
                if (items[i].title.toLowerCase().indexOf(query.toLowerCase()) >= 0 || query.trim() === '') found.push(i);
            }
            return found; //return array with mathced indexes
        },
        // List item Template7 template
        itemTemplate: '<li>' +
            '</li>',
        // Item height
        height: app.theme === 'ios' ? 73 : (app.theme === 'md' ? 73 : 73),
    });
});