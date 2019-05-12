var $doc = document.querySelector.bind(document);

NodeList.prototype.__proto__ = Array.prototype; // eslint-disable-line

function autoCompleteMap(input, latInput, lngInput) {
  if (!input) return; // skip this fn from running if there is not input on the page
  var dropdown = new google.maps.places.Autocomplete(input);

  dropdown.addListener("place_changed", () => {
    var place = dropdown.getPlace();
    latInput.value = place.geometry.location.lat();
    lngInput.value = place.geometry.location.lng();
  });
  // if someone hits enter on the address field, don't submit the form
  $(input).on("keydown", e => {
    if (e.keyCode === 13) e.preventDefault();
  });
}

var host = window.location.origin;

/// web rtc

// function hasGetUserMedia() {
//   // !! converts a value to a boolean and ensures a boolean type.
//   return !!(
//     navigator.getUserMedia ||
//     navigator.webkitGetUserMedia ||
//     navigator.mozGetUserMedia ||
//     navigator.msGetUserMedia
//   );
// }

// const wait = (amount = 0) =>
//   new Promise(resolve => setTimeout(resolve, amount));

// // Put variables in global scope to make them available to the browser console.
// const constraints = (window.constraints = {
//   audio: true,
//   video: true
// });

// var servers = {
//   iceServers: [
//     {
//       urls: "stun:stun.l.google.com:19302"
//     }
//   ]
// };
// var activeRtc = false;
// var pc = new RTCPeerConnection(servers);
// activeRtc = true;
// const video = document.querySelector("video");
// const videoTracks = stream.getVideoTracks();
// var otherpc = new RTCPeerConnection(servers);
// pc.onicecandidate = event => console.log("candidate: ", event.candidate);
// // pc.onadds
// otherpc.onaddstream = function(e) {
//   video.src = window.URL.createObjectURL(e.stream);
// };
// pc.ontrack = event => {
//   if (vid.srcObject) return;
//   vid.srcObject = event.streams[0];
// };

// function init() {
//   navigator.mediaDevices
//     .getUserMedia({
//       audio: true,
//       video: true
//     })
//     .then(stream => {
//       console.log(stream);
//       handleSuccess(stream);
//       return pc.addStream(stream);
//     });
//   pc.createOffer().then(offer => {
//     pc.setLocalDescription(offer);
//     var socket = io(host);
//     socket.emit("offer_created", offer);
//   });
// }
// var socket = io(host);
// socket.on("offer", function(message) {
//   if (message.type === "offer") {
//     pc.setRemoteDescription(new RTCSessionDescription(message));
//     console.log(message);
//     // if (!activeRtc) {
//     pc.createAnswer().then(function(answer) {
//       return pc.setLocalDescription(answer);
//     });
//     // pc = createPeerConnection();
//     //   otherpc.createAnswer().then(function(desc) {
//     //     pc.addIceCandidate(new RTCIceCandidate(msg.ice));
//     //     otherpc.setLocalDescription(new RTCSessionDescription(desc));
//     //   });
//     // }
//   }
// });

// function answerRemote(description) {
//   console.log("desccc: ", description);
//   pc.setLocalDescription(description).then(console.log);
// }

// function handleSuccess(stream) {
//   console.log(stream);
//   var video = document.querySelector("video");
//   var videoTracks = stream.getVideoTracks();
//   console.log("Got stream with constraints:", constraints);
//   console.log(`Using video device: ${videoTracks[0].label}`);
//   window.stream = stream; // make variable available to browser console
//   video.srcObject = stream;
// }

// function handleError(error) {
//     if (error.name === 'ConstraintNotSatisfiedError') {
//         let v = constraints.video;
//         errorMsg(`The resolution ${v.width.exact}x${v.height.exact} px is not supported by your device.`);
//     } else if (error.name === 'PermissionDeniedError') {
//         errorMsg('Permissions have not been granted to use your camera and ' +
//             'microphone, you need to allow the page access to your devices in ' +
//             'order for the demo to work.');
//     }
//     errorMsg(`getUserMedia error: ${error.name}`, error);
// }

// function errorMsg(msg, error) {
//     const errorElement = document.querySelector('#errorMsg');
//     errorElement.innerHTML += `<p>${msg}</p>`;
//     if (typeof error !== 'undefined') {
//         console.error(error);
//     }
// }

// async function init(e) {
//     try {
//         const stream = await navigator.mediaDevices.getUserMedia(constraints);
//         handleSuccess(stream);
//         e.target.disabled = true;
//     } catch (e) {
//         console.log(e);
//     }
// }

// document.querySelector('#showVideo').addEventListener('click', e => init(e));

// video
var canvas = $doc("canvas"),
  video = $doc("video#camera_stream"),
  screenshot = $doc("#screenshot"),
  sendLivePhoto = $doc("#sendLivePhoto"),
  videoTracks,
  imageFile,
  liveForm,
  image = $doc("img.photo");

var constraints = {
  video: true
};

function takeSnapshot() {
  var flow;
  navigator.mediaDevices.getUserMedia(constraints).then(handleSuccess);
}

function handleSuccess(stream) {
  console.log(stream);
  var video = document.querySelector("video");
  videoTracks = stream.getVideoTracks();
  console.log("Got stream with constraints:", constraints);
  console.log(`Using video device: ${videoTracks[0].label}`);
  window.stream = stream; // make variable available to browser console
  video.srcObject = stream;
}

function dataURLtoBlobToFile(dataurl) {
  var arr = dataurl.split(","),
    mime = arr[0].match(/:(.*?);/)[1],
    bstr = atob(arr[1]),
    n = bstr.length,
    u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  var blob = new Blob([u8arr], {
    type: mime
  });
  console.log(blob);

  return new File([blob], "live-photo" + Date.now(), {
    type: "image/png"
  });
}

function reset() {
  $(image).attr("src", "");
  $(video).show();
  videoTracks[0].stop();
  video.src = null;
  videoTracks = null;
  imageFile = null;
  liveForm = null;
}

//smart
var mapElem = document.getElementById("map");
// service worker and indexDB
var dbName = "ughie-db";
var offlinediv = $("#offline_div");

function makeDb() {
  if (!navigator.serviceWorker) {
    return Promise.resolve();
  }

  return idb.openDb(dbName, 1, function (upgradeDb) {
    var store = upgradeDb.createObjectStore("ughies", {
      keyPath: "id"
    });
    var eventStore = upgradeDb.createObjectStore("add_story", {
      keyPath: "time"
    });
    eventStore.createIndex("time", "time");
    store.createIndex("time", "created_at");
  });
}

function IndexController() {
  this._events = [];
  this._startedEventSockets = false;
  this._online = navigator.serviceWorker ? navigator.onLine : true;
  this._db = makeDb();
  this._dbData = [];
  this._addEventListeners();
  this._getDbData();
  this._registerServiceWorker();
  this._openSocketEvent();
  var indexController = this;
  if (this._online) {
    indexController._sendStoryToDb();
  }
  if (mapElem) {
    map = new google.maps.Map(document.getElementById("map"), {
      center: {
        lat: 51.5074,
        lng: 0.1278,
      },
      zoom: 8
    });

    $(mapElem).show()
  }
  // addMarkers(indexController._trimDataForMap())
  setInterval(function () {
    indexController._openSocketEvents();
  }, 10000);
  // indexController._openSocketEvents();
  // this._showDb().then(function () {

  // });
}

IndexController.prototype._addEventListeners = function () {
  var indexController = this;
  indexController._eventsListener();
  indexController._addListener();
  $(document).click(function (event) {
    $target = $(event.target);
    if (!$target.closest("#search_input").length) {
      $(".search_results").html("");
    }
  });
  $("#search_input").on("keyup", e => {
    indexController._autoComplete(e.target.value || "");
    // if (e.keyCode === 13) e.preventDefault();
  });
  $("#search_map").on("keyup", e => {
    indexController._mapSearch(e.target.value || "");
    if (e.keyCode === 13) e.preventDefault();
  });
  $($doc("#photos")).on("change", function () {
    console.log($(this));
    if (this.files.length > 3) {
      alert("You can only select 3 images");
    }
  });

  $('.deleteevent').on("click", function (event) {
    var $this = $(this);
    var id = $this.data('delete_id');
    indexController._deleteStory(id)
  })
  window.addEventListener(
    "offline",
    function (e) {
      this._online = false;
      console.log("You are offline");
      indexController._online = false;

      $($doc("#offline_events_add")).show();
      $(offlinediv).show();
    },
    false
  );

  /**
   * When the client gets online, it hides the off line warning
   */
  window.addEventListener(
    "online",
    function (e) {
      indexController._online = true;
      indexController._sendStoryToDb();
      console.log("You are online");
      $(offlinediv).hide();
      $($doc("#offline_events_add")).hide();
    },
    false
  );
};

function addMarkers(locations) {
  var locations = locations || [];
  var markers = locations.map(function (location, i) {
    var infowindow = new google.maps.InfoWindow({
      content: templateHtml(location)
    });
    var marker = new google.maps.Marker({
      position: location
    });
    marker.addListener("click", function () {
      infowindow.open(map, marker);
    });
    return marker;
  });

  // Add a marker clusterer to manage the markers.
  var markerCluster = new MarkerClusterer(map, markers);
}

function templateHtml(event) {
  var text =
    '<div class="card">' +
    '<div class="card-content">' +
    '<h5 class="card-title">' +
    event.title +
    "</h5>" +
    'Check out the party at <a href="/events/' +
    event.slug +
    '">' +
    event.title +
    " </a>." +
    "</div>" +
    "</div>";
  return text;
}

IndexController.prototype._mapSearch = function (address) {
  var indexController = this;
  var results = indexController._searchLocationInDb(address);
  console.log(results);
  if (results == undefined) return;
  var coords = results.map(function (event) {
    var coordinates = event.location.coordinates;
    return {
      slug: event.slug,
      title: event.title,
      lat: coordinates[0],
      lng: coordinates[1]
    };
  });

  if (!indexController._online) return;
  map = new google.maps.Map(document.getElementById("map"), {
    center: coords[0],
    zoom: 8
  });
  // $(mapElem).hide()

  addMarkers(coords);
  $(mapElem).show();
};
IndexController.prototype._autoComplete = function (input) {
  var indexController = this;
  input = input.trim();
  $($doc(".search_results")).animate({}, 500, function () {
    $(this).html("");
  });

  if (input == "") return;
  var url = "/search" + "?q=" + input;
  console.log(url);
  $.ajax({
    url: url,
    // data: formData,
    method: "GET",
    processData: false,
    contentType: false,
    success: function (data) {
      console.log(data);
      data.forEach(function (event) {
        requestAnimationFrame(function () {
          $($doc(".search_results")).append(
            indexController._buildSearchResultHtml(event)
          );
        });

        // console.log(indexController._buildSearchResultHtml(event))
      });
    },
    error: function (data) {
      console.log("There was an error!!!");
    }
  });
};
IndexController.prototype._addListener = function () {
  if (location.pathname == "/event/add") {
    autoCompleteMap($doc("#address"), $doc("#lat"), $doc("#lng"));
  }
};

function getBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });
}

IndexController.prototype._eventListener = function () {
  var indexController = this;
  if (window.location.pathname == "/event/add") {
    var addeventForm = $doc("#addeventForm");
    var url = window.location.pathname;
    $(sendStoryData).on("click", function (event) {
      var addStoryForm = $doc("#addStory");
      var formData = new FormData(addStoryForm);
      $("#addStoryModal").modal("hide");
      if (formData.getAll("photos").length > 3) {
        alert("You are trying to send more than 3 images");
        return;
      }
      console.log("file: ", formData.get("photos"));

      $.ajax({
        url: url,
        data: formData,
        method: "POST",
        processData: false,
        contentType: false,
        enctype: "multipart/form-data",
        success: function (data) {
          $doc("#addStory").reset();

          $("html, body").animate(
            {
              scrollTop: $(document).height()
            },
            1000
          );
        },
        error: function (data) {
          $doc("#addStory").reset();

          console.log("There was an error!!!");

          indexController._addStoryToDb({
            text: formData.get("text"),
            photos: formData.getAll("photos")
          });
        }
      });
    });
  }
};
IndexController.prototype._eventsListener = function () {
  var indexController = this;
  if (new RegExp("events", "i").test(window.location.pathname)) {
    var sendStoryData = $doc("#sendStoryData");
    var desc = $doc("#desc");
    var photos = $doc("#photos");
    var url = window.location.pathname;
    $(sendStoryData).on("click", function (event) {
      var addStoryForm = $doc("#addStory");
      var formData = new FormData(addStoryForm);
      $("#addStoryModal").modal("hide");
      console.log("file: ", formData.get("photos"));

      $.ajax({
        url: url,
        data: formData,
        method: "POST",
        processData: false,
        contentType: false,
        enctype: "multipart/form-data",
        success: function (data) {
          $doc("#addStory").reset();

          $("html, body").animate(
            {
              scrollTop: $(document).height()
            },
            1000
          );
        },
        error: function (data) {
          $doc("#addStory").reset();

          console.log("There was an error!!!");

          indexController._addStoryToDb({
            text: formData.get("text"),
            photos: formData.getAll("photos")
          });
        }
      });
    });

    $($doc("#takePicture")).on("click", function (event) {
      console.log(event);
      takeSnapshot();
    });

    screenshot.onclick = video.onclick = function () {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      canvas.getContext("2d").drawImage(video, 0, 0);
      // Other browsers will fall back to image/png
      image.src = canvas.toDataURL("image/png");
      imageFile = dataURLtoBlobToFile(canvas.toDataURL("image/png"));
      console.log(imageFile);
      $(video).hide();
      var formData = new FormData();
      formData.append("text", "");
      formData.append("photos", imageFile);
      liveForm = formData;
      console.log(formData);
    };

    sendLivePhoto.onclick = function () {
      if (!liveForm) return;
      var url = window.location.url;
      var formData = window.liveForm;
      $.ajax({
        url: url,
        data: formData,
        method: "POST",
        processData: false,
        contentType: false,
        enctype: "multipart/form-data",
        success: function (data) {
          reset();
          $("#liveStoryModal").modal("hide");
          $("html, body").animate(
            {
              scrollTop: $(document).height()
            },
            1000
          );
        },
        error: function (data) {
          reset();
          $("#liveStoryModal").modal("hide");
          console.log("There was an error!!!");

          indexController._addStoryToDb({
            text: formData.get("text"),
            photos: formData.getAll("photos")
          });
        }
      });
    };
  }
};
IndexController.prototype._getDbData = function () {
  var indexController = this;
  indexController._db.then(function (db) {
    if (!db) return;
    var index = db
      .transaction("ughies")
      .objectStore("ughies")
      .index("time");
    return index.getAll().then(function (events) {
      // console.log('events ',events);
      indexController._dbData = events;
    });
  });
};
IndexController.prototype._updateReady = function (worker) {
  console.log("update is ready");
  worker.postMessage({
    action: "skipWaiting"
  });
};
IndexController.prototype._trackInstallingSw = function (worker) {
  var indexController = this;
  worker.addEventListener("statechange", function () {
    if (worker.state == "installed") {
      indexController._updateReady(worker);
    }
  });
};

IndexController.prototype._buildStoryHtml = function (story) {
  var photos = story.photos;
  var photostext = "";
  photos.map(function (photo) {
    photostext += '<img src="/images/uploads/' + photo + '">';
  });
  return (
    '<div class="card m-1">' +
    '<div class="photos">' +
    photostext +
    "</div>" +
    '<div class="card-content">' +
    '<p >' +
    story.text +
    "</p>" +
    '<small class="right">' +
    story.author.username +
    "</small>" +
    "</div>" +
    "</div>"
  );
};
IndexController.prototype._buildSearchResultHtml = function (event) {
  var photostext = "";
  // if (photos[0]) {
  //     photostext += '<img src="/images/uploads/' + photos[0] + '">';
  // }
  return (
    '<div class="search-user" style="top: 0px !important">' +
    '<div class="user-list">' +
    '<div class="user">' +
    '<h6 style="padding-left: 10px " > <a style="text-decoration: none; color: black;" href="/events/' +
    event.slug +
    '" >' +
    event.title +
    "</a></h6>" +
    "</div>" +
    "</div>" +
    "</div>"
  );
};
IndexController.prototype._buildEventHtml = function (event) {
  return (
    '<div class="event">' +
    '<a href="/events/' +
    event.slug +
    '" class="title">' +
    event.title +
    "</a>" +
    '<small class="data float-right">' +
    event.e_time +
    "</small>" +
    "</div>"
  );
};
IndexController.prototype._registerServiceWorker = function () {
  var indexController = this;

  if (!navigator.serviceWorker) {
    return;
  }

  if (!navigator.serviceWorker.controller) {
    // return;
  }

  navigator.serviceWorker
    .register("/sw.js")
    .then(function (swRegistration) {
      // if the service worker is waiting
      if (swRegistration.waiting) {
        indexController._updateReady();
        console.log("waiting: ", swRegistration);
        return;
      }
      if (swRegistration.installing) {
        console.log("installing: ", swRegistration);
        indexController._trackInstallingSw(swRegistration.installing);
        return;
      }
      swRegistration.addEventListener("updatefound", function (event) {
        indexController._trackInstallingSw(swRegistration.installing);
      });
      console.log("Registration worked");
    })
    .catch(function () {
      console.log("Registration failed");
    });

  var refreshing;
  navigator.serviceWorker.addEventListener("controllerchange", function (event) {
    if (refreshing) return;
    window.location.reload();
    refreshing = true;
  });
};
IndexController.prototype._openSocketEvents = function () {
  var indexController = this;
  var socket = io(host);
  socket.on("events", function (events) {
    // if (
    //     indexController._startedEventSockets &&
    //     JSON.stringify(indexController._dbData) == JSON.stringify(events.data)
    // )
    //     return;
    if (
      indexController._startedEventSockets &&
      indexController._events.length == events.data.length
    )
      return;
    console.log("yatsie");
    indexController._events = events.data;

    if (indexController._startedEventSockets == false) {
      indexController._startedEventSockets = true;
    }
    requestAnimationFrame(function () {
      indexController._onSocketEventProcess(indexController._events);
    });
  });

  // try and reconnect in 5 seconds
  // setTimeout(function () {
  //     indexController._openSocketEvents();
  // }, 5000);
};

IndexController.prototype._searchLocationInDb = function (location) {
  location = location.trim().toLowerCase();
  if (location == "") return;
  var indexController = this;
  return indexController._dbData.filter(function (event) {
    var address = event.location.address;
    if (new RegExp(location.toLowerCase(), "i").test(address))
      return {
        location: event.location
      };
  });
};

IndexController.prototype._trimDataForMap = function (location) {
  var indexController = this;
  return indexController._dbData.map(function (event) {
    var address = event.location.address;
    var coordinates = event.location.coordinates;
    return {
      address: address,
      slug: event.slug,
      title: event.title,
      lat: coordinates[0],
      lng: coordinates[1]
    };
  });
};
IndexController.prototype._openSocketEvent = function () {
  var indexController = this;
  var socket = io(host);
  socket.on("new", function (data) {
    requestAnimationFrame(function () {
      indexController._addStory(data);
    });
  });
  socket.on("delete", function (id) {
    requestAnimationFrame(function () {
      $('.'.concat(id)).get(0).remove();
    });
  });
};

IndexController.prototype._addStory = function (data) {
  var indexController = this;
  if (new RegExp("events", "i").test(window.location.pathname)) {
    $($doc(".stories")).append(indexController._buildStoryHtml(data));
  }
};

IndexController.prototype._addStoryToDb = function (event) {
  var indexController = this;
  // console.log(event);
  this._db.then(function (db) {
    var tx = db.transaction("add_story", "readwrite");
    var store = tx.objectStore("add_story");
    store.put({
      time: Date.now(),
      text: event.text,
      photos: event.photos,
      url: window.location.pathname
    });
  });
};

IndexController.prototype._sendStoryToDb = function () {
  var indexController = this;

  if (
    indexController._online &&
    new RegExp("events", "i").test(window.location.pathname)
  ) {
    // console.log(event);
    this._db.then(function (db) {
      if (!db) return;
      var tx = db.transaction("add_story", "readwrite");
      var store = tx.objectStore("add_story");
      store.openCursor().then(function delC(cursor) {
        if (!cursor) return;
        var value = cursor.value;
        console.log(value);
        var form_data = new FormData();

        form_data.append("text", value.text);
        for (var i = 0; i < value.photos.length; i++) {
          form_data.append("photos", value.photos[i]);
        }
        if (form_data.getAll("photos").length > 3) {
          console.log(form_data);
          cursor.delete();
          return cursor.continue().then(delC);
        }
        $.ajax({
          url: value.url,
          data: form_data,
          method: "POST",
          processData: false,
          contentType: false,
          enctype: "multipart/form-data",
          success: function (data) {
            console.log("data: ", data);
            $("html, body").animate(
              {
                scrollTop: $(document).height()
              },
              1000
            );
          },
          error: function (data) {
            console.log("There was an error!!!");

            indexController._addStoryToDb({
              text: form_data.get("text"),
              photos: form_data.getAll("photos")
            });
          }
        });
        cursor.delete();
        return cursor.continue().then(delC);
      });
      // return index.getAll().then(function (stories) {
      //   console.log(stories)
      // });
    });
  }
};
IndexController.prototype._onSocketEventProcess = function (events) {
  var indexController = this;
  // console.log(events);
  this._db.then(function (db) {
    var tx = db.transaction("ughies", "readwrite");
    var store = tx.objectStore("ughies");
    events.forEach(event => {
      store.put(event);
    });
    indexController._getDbData();
    console.log("started: ", indexController._startedEventSockets);
    // if (
    //     (indexController._dbData.length) !==
    //     (indexController._events.length)
    // ) {
    console.log("1 12");
    store.openCursor().then(function delC(cursor) {
      // console.log(cursor.value.id)
      if (!cursor) return;
      if (
        !indexController._events.some(function (obj) {
          return obj.id == cursor.value.id;
        })
      ) {
        cursor.delete();
      }
      return cursor.continue().then(delC);
    });
    // }
    requestAnimationFrame(function () {
      indexController._showDb();
    });
  });
};

IndexController.prototype._showDb = function () {
  var indexController = this;
  // indexedDB.deleteDatabase('ughies').then()

  return this._db.then(function (db) {
    if (!db) return;
    var index = db
      .transaction("ughies")
      .objectStore("ughies")
      .index("time");
    return index.getAll().then(function (events) {
      var allStories = "";
      events.forEach(function (event) {
        allStories += indexController._buildEventHtml(event);
      });
      requestAnimationFrame(function () {
        $(".events").html(allStories);
      });
    });
  });
};

IndexController.prototype._deleteStory = function (id) {
  var indexController = this;
  if (!id) return;
  // indexedDB.deleteDatabase('ughies').then()
  $.ajax({
    url: '/story',
    method: 'DELETE',
    data: { id: id },
    success: function (data) {
      console.log(data);

    },
    error: function (data) {
      console.log(data, 'index error');
    }

  })
};

var Ughie;
$(document).ready(function () {
  console.log("ready!");
  Ughie = new IndexController();
});
