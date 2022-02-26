const moey = document.querySelector('#spotlight-moey')
const brendon = document.querySelector('#spotlight-brendon')
const moya = document.querySelector('#spotlight-moya')
const nicky = document.querySelector('#latitude-value')
const john = document.querySelector('#longitude-value')
const harry = document.querySelector('#address-value')
const mappy = document.querySelector('#grid-map')
const gridLeftSide = document.querySelector('#grid-left-side')
const totalStations = document.querySelector('#total-stations')
const nearestStationElement = document.querySelectorAll('.nearest-5-element')
const statsContainer = document.querySelector('#stats-container')

// global variables
let currentRandom;
let lat;
let lng;
let map, infoWindow;
let currentStation;

function initMap() {
  map = new google.maps.Map(document.getElementById("map"), {
    center: { lat: -37.8304177, lng: 144.964172 },
    zoom: 13,
    minZoom: 11
  });
  infoWindow = new google.maps.InfoWindow();

  //  Try HTML5 geolocation.
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const pos = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        infoWindow.setPosition(pos);
        infoWindow.open(map);
        infoWindow.setContent("Location found.");
        map.setCenter(pos);
        handleLatLong()
        nicky.textContent = pos.lat;
        john.textContent = pos.lng;
      },
      () => {
        handleLocationError(true, infoWindow, map.getCenter());
      }
    );
  } else {
    // Browser doesn't support Geolocation
    handleLocationError(false, infoWindow, map.getCenter());
  }

  initOwners()
  initMarkers()
  handleLatLong()
}

function handleLocationError(browserHasGeolocation, infoWindow, pos) {
  infoWindow.setPosition(pos);
  infoWindow.setContent(
    browserHasGeolocation
      ? "Error: The Geolocation service failed."
      : "Error: Your browser doesn't support geolocation."
  );
  infoWindow.open(map);
}

// stations markers
function initMarkers() {
  // let url = "http://localhost:8080/api/stations/all"
  let url = "/api/stations/all"
  axios
    .get(url)
    .then(res => {
      let allStations = res.data.rows
      allStations.forEach(station => {
        let obj = {
          lat: station.latitude,
          lng: station.longitude
        }
        let owner = station.owner
        new google.maps.Marker({
          position: obj,
          map,
          title: owner,
          icon: stationIcon(station)
        });
      })
    })
}

// station marker icons
function stationIcon(station) {
  if (station.owner === 'BP') {
    return "/icon/BP.png"
  } else if (station.owner === 'Shell') {
    return "/icon/Shell.png"
  } else if (station.owner === '7-Eleven Pty Ltd') {
    return "/icon/7-Eleven.png"
  } else if (station.owner === 'Independent Fuel Supplies') {
    return "/icon/Independent.png"
  } else if (station.owner === 'Horizon') {
    return "/icon/Horizon.png"
  } else if (station.owner === 'Ampol') {
    return "/icon/Ampol.png"
  } else if (station.owner === 'Atlas Fuels Pty Ltd') {
    return "/icon/Atlas.png"
  } else if (station.owner === 'Caltex') {
    return "/icon/Caltex.png"
  }
}

// handles stats
function initOwners() {
  let url = "/api/owners"
  axios
    .get(url)
    .then(res => {
      let owners = res.data
      let totalStationsElement = document.createElement("p")
      totalStationsElement.textContent = Object.values(owners).reduce((accum, num) => accum + num, 0)
      totalStations.after(totalStationsElement)

      Object.keys(owners).forEach(key => {
        if (owners[key] > 10) {
          // reason to create grid and divs here - if we expand our data and it creates more owners, this won't break it, it'll keep adding new owners
          let stationCountElement = document.createElement('div')
          stationCountElement.style.display = 'flex'
          stationCountElement.style.justifyContent = 'space-between'
          stationCountElement.style.fontSize = '20px'
          stationCountElement.style.marginBottom = '30px'
          stationCountElement.style.fontWeight = '500'
          stationCountElement.style.color = servoColor[key]
          let ownerNameElement = document.createElement("div")
          let ownerCountElement = document.createElement('div')
          stationCountElement.appendChild(ownerNameElement)
          stationCountElement.appendChild(ownerCountElement)
          ownerNameElement.textContent = key
          ownerCountElement.textContent = owners[key]
          statsContainer.appendChild(stationCountElement)
        }
      })
    });
}

let servoColor = {
  'BP': 'yellowgreen',
  'Shell': 'coral',
  '7-Eleven Pty Ltd': 'olivedrab',
  'Independent Fuel Supplies': 'gray',
  'Horizon': 'gold',
  'Ampol': 'darkorange',
  'Atlas Fuels Pty Ltd': 'mistyrose',
  'Caltex': 'steelblue',
  'United': 'dodgerblue'
}

// handles spotlight
function handleMoey() {
  let url = "/api/stations/random"
  // let url = "http://localhost:8080/api/stations/random"
  axios.get(url).then(res => {
    brendon.textContent = res.data.name
    moya.textContent = res.data.owner
    currentRandom = res.data
  })
}

//reusable function - to handle current location section
function handleBrendon() {
  nicky.textContent = currentRandom["latitude"]
  john.textContent = currentRandom["longitude"]
  harry.textContent = currentRandom["street_address"] + ', ' + currentRandom["state"] + ', Australia'
  map.setCenter({ lat: currentRandom["latitude"], lng: currentRandom["longitude"] });
  map.setZoom(5)
}

//==================
// Recommend renaming this function to 'setNearest5', or breaking down into smaller functions for separate purposes (e.g. handleLatLong and setNearest5). Could probably put some of the data gathering in an API route instead?  - Moya
function handleLatLong() {
  lat = map.getCenter().lat()
  lng = map.getCenter().lng();
  nicky.textContent = lat;
  john.textContent = lng;
  handleDistance()
}

// handles nearest 5 stations || because it has its own function, it can now be called right away in initMap to display the nearest stations upon opening app
function handleDistance() {
  let url = "/api/stations/all"
  // let url = "http://localhost:8080/api/stations/all"
  axios.get(url).then(res => {
    let allStations = res.data.rows
    allStations.forEach(station => {
      let dLat = Math.PI / 180 * (station["latitude"] - lat);
      let dLong = Math.PI / 180 * (station["longitude"] - lng);
      let a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(Math.PI / 180 * lat) * Math.cos(Math.PI / 180 * lat) * Math.sin(dLong / 2) * Math.sin(dLong / 2);
      let c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      let distance = 6371 * c;
      station["distance"] = distance
      currentStation = station

      handleColors('BP', 'yellowgreen')
      handleColors('Shell', 'coral')
      handleColors('7-Eleven Pty Ltd', 'olivedrab')
      handleColors('Independent Fuel Supplies', 'lavender')
      handleColors('Horizon', 'gold')
      handleColors('Ampol', 'darkorange')
      handleColors('Atlas Fuels Pty Ltd', 'mistyrose')
      handleColors('Caltex', 'steelblue')
      handleColors('United', 'dodgerblue')
    })
    handleNearbyStations(allStations)
  })
}

function handleColors(owner, color) {
  if (currentStation.owner === owner) {
    currentStation["color"] = color
  }
}

// handling the 5 nearest stations, called from handle distance
function handleNearbyStations(stations) {
  stations.sort((a, b) => {
    if (a.distance < b.distance) {
      return -1;
    } else if (a.distance > b.distance) {
      return 1;
    } else {
      return 0;
    }
  })

  let counter = 0
  nearestStationElement.forEach(station => {
    station.innerHTML = `${stations[counter].name} <br/> Address: ${stations[counter].street_address}, ${stations[counter].suburb}`
    station.style.backgroundColor = stations[counter].color
    counter++
  })
}

//==================
moey.addEventListener('click', handleMoey)
brendon.addEventListener('click', handleBrendon)
mappy.addEventListener('mouseup', handleLatLong)

//==================
// mappy.addEventListener('mousedown', handleLatLong)
//==================