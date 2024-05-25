var map;
let markers = [];
let newMarker;
// const API_URL = "http://127.0.0.1:3000";
const API_URL = "https://sgeatwhere.onrender.com";

// let declares a block-scoped variable, which means it's only accessible within the block in which it's defined.
// newMarker is intended to be used within the initMap and addMarker functions. Using let ensures that it's scoped to these functions and not accessible outside of them.
// Additionally, using let instead of var allows for better code readability and maintainability, as it limits the scope of newMarker to where it's actually needed.

//  Coordinates for MRT stations
const buonaVistaMRT = { lat: 1.3074177591198148, lng: 103.78984059533414 };
const clementiMRT = { lat: 1.3157320708493883, lng: 103.7650341376623 };
const queenstownMRT = { lat: 1.2949046236465185, lng: 103.80583738778117 };
const brasBasahMRT = { lat: 1.2977384060268324, lng: 103.85050163878333 };

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
    scaledSize: new google.maps.Size(35, 35), // Scaled size of the icon (width, height)};
  };

  // Initialize the map
  map = new google.maps.Map(document.getElementById("google-map"), mapOptions);
}

// Call server.js to display food locations for each MRT station
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

// Add location markers to the map
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

    // Create info window content based on marker data
    const content = `
    <div class="info-window-content" style="font-family: 'Montserrat', sans-serif; color: #3C3633">
        <strong>${data.location_name}</strong>
        <p style="font-size: smaller; color: grey;">${data.address}</p>
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

// Display location names and content
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
        <strong>${data.location_name}</strong>

        <p>
        <strong>Address:</strong> ${data.address} </br>
        <strong>Distance from MRT:</strong> ${distance.toFixed(0)} metres </br>
        <a href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
          data.location_name
        )}" target="_blank" class="view-map-link">View on Google Maps</a>
        </p>

        <div class="bottom-content">
        <p class="location-category ${getCategoryClass(data.category)}">${
      data.category
    }</p>
    <button class="show-food-options-btn" data-location="${
      data.location_name
    }">More Food >> </button>
      </div>
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
  const data = { location: location_name };

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

  // Create container for food options
  const foodOptionsContainer = document.createElement("div");
  foodOptionsContainer.classList.add("food-options-container");

  // Create filter
  const filter = document.getElementById("filter-list");

  const filterContent = `
  <id="filter-list" class="filter-container">  
    <label for="establishment-type-filter" class="filter-label">Establishment Type</label>
    <select id="establishment-type-filter" class="form-select">
      <option value="ALL">All Types</option>
      <option value="RESTAURANT">Restaurant</option>
      <option value="EATERY">Eatery</option>
      <option value="CAFE">Cafe</option>
      <option value="BAR">Bar</option>
      <option value="EATERY">Small Kiosk</option>
      <option value="TAKEAWAY">Dabao</option>
    </select>

    <label for="cuisine-type-filter" class="filter-label">Cuisine</label>
    <select id="cuisine-type-filter" class="form-select">
      <option value="ALL">All Cuisines</option>
      <option value="CHINESE">Chinese</option>
      <option value="HALAL">Halal</option>
      <option value="INDIAN">Indian</option>
      <option value="LOCAL">Local</option>
      <option value="NYONYA">Nyonya</option>
      <option value="FAST FOOD">Fast Food</option>
      <option value="SALAD">Salad</option>
      <option value="WESTERN">Western</option>
      <option value="JAPANESE">Japanese</option>
      <option value="KOREAN">Korean</option>
      <option value="VIETNAMESE">Vietnamese</option>
      <option value="THAI">Thai</option>
      <option value="MEXICAN">Mexican</option>
      <option value="PORTUGESE">Portugese</option>
      <option value="TAIWANESE">Taiwanese</option>
      <option value="VEGETARIAN">Vegetarian</option>
      <option value="BUBBLE TEA">Bubble Tea</option>
      <option value="DRINK">Drink</option>
      <option value="DESSERT">Dessert</option>
      <option value="BAKERY">Bakery</option>      
      <option value="PASTRIES & SNACKS">Pastries & Snacks</option>
    </select>

    <button id="random-food-btn" class="random-food-btn">Randomly Suggest >></button>
  </div>
  `;
  filter.innerHTML = filterContent;

  // Event listener for filter changes
  document
    .getElementById("establishment-type-filter")
    .addEventListener("change", () => filterFoodOptions(result));
  document
    .getElementById("cuisine-type-filter")
    .addEventListener("change", () => filterFoodOptions(result));

  // Event listener for the Random Food Option button
  document.getElementById("random-food-btn").addEventListener("click", () => {
    getRandomFoodOption(result);
  });

  // Create and display cards for each food option
  displayFoodOptions(result.data);
}

// Create cards based on foodOption
function createCard(foodOption) {
  const card = document.createElement("div");
  card.classList.add("food-option-card", "mb-3");
  card.innerHTML = `

  <div class="food-option-card-header">
  <h6>${foodOption.food_name}</h6>
  </div>

  <div class="food-option-card-body">
  <p><strong>Type:</strong> ${foodOption.establishment_type}</p>
  <p><strong>Cuisine:</strong> ${foodOption.cuisine}</p>
  <p><strong>Stall No.:</strong> ${foodOption.stall_no}</p>
  </div>
  `;
  return card;
}

function displayFoodOptions(data) {
  const foodOptionsDiv = document.getElementById("food-options");
  foodOptionsDiv.innerHTML = ""; // Clear existing food options
  data.forEach((foodOption) => {
    foodOptionsDiv.appendChild(createCard(foodOption));
  });
}

function filterFoodOptions(result) {
  const establishmentFilterValue = document.getElementById(
    "establishment-type-filter"
  ).value;
  const cuisineFilterValue = document.getElementById(
    "cuisine-type-filter"
  ).value;

  const filteredData = result.data.filter((foodOption) => {
    const matchesEstablishment =
      establishmentFilterValue === "ALL" ||
      foodOption.establishment_type === establishmentFilterValue;

    const cuisineTypes = foodOption.cuisine
      .split(",")
      .map((cuisine) => cuisine.trim());
    const matchesCuisine =
      cuisineFilterValue === "ALL" || cuisineTypes.includes(cuisineFilterValue);

    return matchesEstablishment && matchesCuisine;
  });

  displayFoodOptions(filteredData);
}

// Function to randomly select a food option based on the selected or "ALL" cuisine type
function getRandomFoodOption(result) {
  // Consider all cuisine types
  const filteredData = result.data;

  // Randomly select a food option from the filtered data
  if (filteredData.length > 0) {
    const randomIndex = Math.floor(Math.random() * filteredData.length);
    const randomFoodOption = filteredData[randomIndex];
    displayRandomFoodOption(randomFoodOption);
  } else {
    alert("No food options available.");
  }
}

// Function to display the randomly selected food option
function displayRandomFoodOption(foodOption) {
  const foodOptionsDiv = document.getElementById("food-options");
  foodOptionsDiv.innerHTML = ""; // Clear existing food options

  const card = createCard(foodOption);
  foodOptionsDiv.appendChild(card);
}

// Function to clear food options
function clearFoodOptions() {
  const foodOptionsDiv = document.getElementById("food-options");
  foodOptionsDiv.innerHTML = "";
}

// Function to clear markers from the map
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
    case "BUSINESS CENTRE":
      return "business-centre";
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
