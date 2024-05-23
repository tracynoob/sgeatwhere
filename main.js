var map;
let markers = [];
let newMarker;
const API_URL = "http://127.0.0.1:3000";
// const API_URL = "https://sgeatwhere.onrender.com:3000";
// let for newMarker:
// let declares a block-scoped variable, which means it's only accessible within the block in which it's defined.
// newMarker is intended to be used within the initMap and addMarker functions. Using let ensures that it's scoped to these functions and not accessible outside of them.
// Additionally, using let instead of var allows for better code readability and maintainability, as it limits the scope of newMarker to where it's actually needed.

//  Coordinates for MRT stations
const buonaVistaMRT = { lat: 1.3074177591198148, lng: 103.78984059533414 };
const clementiMRT = { lat: 1.3157320708493883, lng: 103.7650341376623 };
const queenstownMRT = { lat: 1.2949046236465185, lng: 103.80583738778117 };
const brasBasahMRT = { lat: 1.2977384060268324, lng: 103.85050163878333 };

// *Removed after connecting to server.js and supabase*
// function getLocationData(locationName) {
//   const allLocations = [].concat(
//     buonaVistaData,
//     clementiData,
//     queenstownData,
//     brasBasahData
//   );
//   return allLocations.find(
//     (location) => location.locationName === locationName
//   );
// }
// Function to load the Google Maps API script

// Initialize the Google Map
function initMap() {
  // Code for Singapore lat lng
  const centerMapSG = { lat: 1.3585778, lng: 103.8271599 };
  const mapOptions = {
    center: centerMapSG,
    zoom: 12,
  };
  // Code for custom marker
  newMarker = {
    url: "./images/foodmap.png", // URL to the custom marker image
    scaledSize: new google.maps.Size(30, 30), // Scaled size of the icon (width, height)};
  };

  // Initialize the map
  map = new google.maps.Map(document.getElementById("google-map"), mapOptions);
}

// Add marker functions for each MRT station
async function BuonaVistaLocations() {
  const response = await fetch(API_URL + "/getBuonaVistaLocations", {
    method: "GET",
  });
  const data = await response.json();
  const str_data = JSON.stringify(data);
  const json = JSON.parse(str_data);
  // console.log(typeof json.data);
  // console.log(json.data);
  clearFoodOptions();
  displayLocationNames(json.data, buonaVistaMRT);
  addMarkers(json.data, buonaVistaMRT);
}

async function ClementiLocations() {
  const response = await fetch(API_URL + "/getClementiLocations", {
    method: "GET",
  });
  const data = await response.json();
  const str_data = JSON.stringify(data);
  const json = JSON.parse(str_data);
  // console.log(typeof json.data);
  // console.log(json.data);
  clearFoodOptions();
  displayLocationNames(json.data, clementiMRT);
  addMarkers(json.data, clementiMRT);
}

async function QueenstownLocations() {
  const response = await fetch(API_URL + "/getQueenstownLocations", {
    method: "GET",
  });
  const data = await response.json();
  const str_data = JSON.stringify(data);
  const json = JSON.parse(str_data);
  // console.log(typeof json.data);
  // console.log(json.data);
  clearFoodOptions();
  displayLocationNames(json.data, queenstownMRT);
  addMarkers(json.data, queenstownMRT);
}

async function BrasBasahLocations() {
  const response = await fetch(API_URL + "/getBrasBasahLocations", {
    method: "GET",
  });
  const data = await response.json();
  const str_data = JSON.stringify(data);
  const json = JSON.parse(str_data);
  // console.log(typeof json.data);
  // console.log(json.data);
  clearFoodOptions();
  displayLocationNames(json.data, brasBasahMRT);
  addMarkers(json.data, brasBasahMRT);
}

// *Removed after connecting to server.js and supabase*
// async function displayBuonaVistaInfo() {
//   const response = await fetch("http://127.0.0.1:3000/displayLocationNames", {
//     method: "GET",
//   });
//   console.log(await response.json());
//   clearFoodOptions();
//   displayLocationNames(buonaVistaData, buonaVistaMRT);
//   addMarkers(buonaVistaData, buonaVistaMRT);
// }
// function displayClementiInfo() {
//   clearFoodOptions();
//   displayLocationNames(clementiData, clementiMRT);
//   addMarkers(clementiData, clementiMRT);
// }
// function displayQueenstownInfo() {
//   clearFoodOptions();
//   displayLocationNames(queenstownData, queenstownMRT);
//   addMarkers(queenstownData, queenstownMRT);
// }
// function displayBrasBasahInfo() {
//   clearFoodOptions();
//   displayLocationNames(brasBasahData, brasBasahMRT);
//   addMarkers(brasBasahData, brasBasahMRT);
// }

// Add markers to the map and display location information
function addMarkers(locationData, mrtCoordinates) {
  // Remove previous markers from the map
  clearMarkers();
  // Track the currently open info window
  let openInfoWindow = null;
  const bounds = new google.maps.LatLngBounds();

  // Iterate over marker data
  locationData.forEach((data) => {
    const position = { lat: data.lat, lng: data.lng };
    const markerOptions = {
      position: position,
      map: map,
      icon: newMarker,
      optimized: false,
      animation: google.maps.Animation.DROP,
    };

    // Code to show marker
    const marker = new google.maps.Marker(markerOptions);
    // Extend the bounds to include the marker's position
    bounds.extend(marker.getPosition());
    // Store the marker in the markers array
    markers.push(marker);

    // Code to calculate dist from MRT stations
    const distance = calculateDistance(
      mrtCoordinates.lat,
      mrtCoordinates.lng,
      data.lat,
      data.lng
    );

    // Create info window content based on marker data
    const content = `
    <div class="info-window-content" style="font-family: 'Montserrat', sans-serif; color: #3C3633">
        <h4>${data.location_name}</h4>
        <p>${data.address}</p>
    </div>
`;

    const infoWindow = new google.maps.InfoWindow({
      content: content,
      minWidth: 250,
      maxWidth: 300,
    });

    // Event listener for marker click
    marker.addListener("click", function () {
      // Close the previously opened info window, if any
      if (openInfoWindow) {
        openInfoWindow.close();
      }
      // Open the current info window
      infoWindow.open(map, marker);
      // Update the currently open info window
      openInfoWindow = infoWindow;
    });
  });

  // Fit the map to the bounds of the markers
  map.fitBounds(bounds);
}

// Display location names above Google Maps
function displayLocationNames(locationData, mrtCoordinates) {
  const locationNamesContainer = document.getElementById("location-names");
  locationNamesContainer.innerHTML = ""; // Clear previous location names

  // Create a flex container for location cards
  const locationCardsContainer = document.createElement("div");
  locationCardsContainer.classList.add("location-cards-container");

  // Create a card for each location
  locationData.forEach((data) => {
    const card = document.createElement("div");
    card.classList.add("location-card");

    // Calculate distance from MRT
    const distance = calculateDistance(
      mrtCoordinates.lat,
      mrtCoordinates.lng,
      data.lat,
      data.lng
    );

    // Construct card content
    const content = `
      <div class="location-card-content location-card-content-small">
        <img src="${data.imgURL}" alt="${
      data.location_name
    }" class="location-image">
        <p style="font-size: smaller; color: grey;">Source: ${data.img_source.toLowerCase()}</p>
        <h4>${data.location_name}</h4>
        <p><strong>Address:</strong> ${data.address}</p>
        <p><strong>Distance from MRT:</strong> ${distance.toFixed(0)} metres</p>
        <button class="show-food-options-btn" data-location="${
          data.location_name
        }">Show Food Options</button>
        <p><a href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
          data.location_name
        )}" target="_blank" class="view-map-link">View on Google Maps</a></p>
        <p class="location-category ${getCategoryClass(data.category)}">${
      data.category
    }</p>
      </div>
    `;

    card.innerHTML = content;

    // Add event listener to show food options button
    const showFoodOptionsBtn = card.querySelector(".show-food-options-btn");
    showFoodOptionsBtn.addEventListener("click", function () {
      showFoodOptions(this.getAttribute("data-location"));
    });
    locationCardsContainer.appendChild(card);
  });
  // Append the location cards container to the main container
  locationNamesContainer.appendChild(locationCardsContainer);
}

// call server.js to display food options for a location
async function showFoodOptions(location_name) {
  let result = "";
  const data = {
    location: location_name,
  };
  try {
    const request = await fetch(API_URL + "/getFoodOptions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    result = await request.json();
    console.log("Success:", result.data);
  } catch (error) {
    console.error("Error:", error);
  }
  const foodOptionsDiv = document.getElementById("food-options");
  // Clear previous food options
  foodOptionsDiv.innerHTML = "";
  // Create container for food options
  const foodOptionsContainer = document.createElement("div");
  foodOptionsContainer.classList.add("food-options-container");
  // Create cards for each food option
  result.data.forEach((foodOption) => {
    const card = document.createElement("div");
    card.classList.add("food-option-card");
    // Parse the food stall name, type of food stall, and type of cuisine
    card.innerHTML = `
      <h4>${foodOption.food_name}</h4>
      <p><strong>Establishment Type:</strong> ${foodOption.establishment_type}</p>
      <p><strong>Cuisine:</strong> ${foodOption.cuisine}</p>
      <p><strong>Stall #:</strong> ${foodOption.stall_no}</p>
    `;
    foodOptionsDiv.appendChild(card);
  });
}

// // Function to display food options for a location
// function showFoodOption(locationName) {
//   const locationData = getLocationData(locationName);
//   const foodOptionsDiv = document.getElementById("food-options");
//   if (locationData && locationData.foodOptions) {
//     // Clear previous food options
//     foodOptionsDiv.innerHTML = "";
//     // Create container for food options
//     const foodOptionsContainer = document.createElement("div");
//     foodOptionsContainer.classList.add("food-options-container");
//     // Create cards for each food option
//     locationData.foodOptions.forEach((option) => {
//       const card = document.createElement("div");
//       card.classList.add("food-option-card");
//       // Parse the food stall name, type of food stall, and type of cuisine
//       const [food_name, establishment_type, cuisine] = option.split(" - ");
//       card.innerHTML = `
//         <h4>${food_name}</h4>
//         <p><strong>Establishment Type:</strong> ${establishment_type}</p>
//         <p><strong>Cuisine:</strong> ${cuisine}</p>
//       `;
//       foodOptionsDiv.appendChild(card);
//     });
//   } else {
//     // If no food options available, display a message
//     foodOptionsDiv.innerHTML =
//       "<p>No food options available for " + locationName + "</p>";
//   }
// }
// Function to clear food options
function clearFoodOptions() {
  const foodOptionsDiv = document.getElementById("food-options");
  foodOptionsDiv.innerHTML = "";
}

// Clear markers from the map
function clearMarkers() {
  // Iterate over the markers array and remove each marker from the map
  markers.forEach((marker) => {
    marker.setMap(null);
  });
  // Empty the markers array
  markers = [];
}

// Get CSS class based on category
function getCategoryClass(category) {
  switch (category) {
    case "SHOPPING MALL":
      return "shopping-mall";
    case "HOTEL":
      return "hotel";
    case "BUSINESS CENTER":
      return "business-center";
    default:
      return "hawker-centre";
  }
}

// Calculate distance between two coordinates
function calculateDistance(lat1, lng1, lat2, lng2) {
  const toRad = (value) => (value * Math.PI) / 180;
  const R = 6371000; // Earth's radius in meters
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}
