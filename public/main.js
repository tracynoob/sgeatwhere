var map;
let markers = [];
let newMarker;
// const API_URL = "http://127.0.0.1:3000";
const API_URL = "https://sgeatwhere.onrender.com";

// let declares a block-scoped variable, which means it's only accessible within the block in which it's defined.
// newMarker is intended to be used within the initMap and addMarker functions. Using let ensures that it's scoped to these functions and not accessible outside of them.

//  Coordinates for MRT stations
const buonaVistaMRT = { lat: 1.3074177591198148, lng: 103.78984059533414 };
const clementiMRT = { lat: 1.3157320708493883, lng: 103.7650341376623 };
const cityHallMRT = { lat: 1.29331196963223, lng: 103.85212131400863 };
const brasBasahMRT = { lat: 1.2977384060268324, lng: 103.85050163878333 };

// Sign in function
document.getElementById("signin-button").addEventListener("click", () => {
  window.location.href = `${API_URL}/auth/signin?provider=github`;
});

document
  .getElementById("signout-button")
  .addEventListener("click", async () => {
    await fetch(`${API_URL}/auth/signout`);
    handleUser(null);
  });

window.addEventListener("load", async () => {
  const response = await fetch(`${API_URL}/auth/status`);
  const user = await response.json();
  handleUser(user);
});

function handleUser(user) {
  const signInButton = document.getElementById("signin-button");
  const signOutButton = document.getElementById("signout-button");
  const userInfo = document.getElementById("user-info");
  const userEmail = document.getElementById("user-email");

  if (user) {
    signInButton.style.display = "none";
    signOutButton.style.display = "block";
    userInfo.style.display = "block";
    userEmail.textContent = user.email;
  } else {
    signInButton.style.display = "block";
    signOutButton.style.display = "none";
    userInfo.style.display = "none";
    userEmail.textContent = "";
  }
}

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
  const locationData = await response.json(); // returns parsed JSON object
  // console.log(typeof locationData.data);
  // console.log(locationData.data);
  clearFoodOptions();
  clearFilterOptions();
  displayLocationNames(locationData.data, buonaVistaMRT);
  addMarkers(locationData.data, buonaVistaMRT);
}

async function ClementiLocations() {
  const response = await fetch(API_URL + "/getClementiLocations", {
    method: "GET",
  });
  const locationData = await response.json();
  // console.log(typeof locationData.data);
  // console.log(locationData.data);
  clearFoodOptions();
  clearFilterOptions();
  displayLocationNames(locationData.data, clementiMRT);
  addMarkers(locationData.data, clementiMRT);
}

async function CityHallLocations() {
  const response = await fetch(API_URL + "/getCityHallLocations", {
    method: "GET",
  });
  const locationData = await response.json();
  // console.log(typeof locationData.data);
  // console.log(locationData.data);
  clearFoodOptions();
  clearFilterOptions();
  displayLocationNames(locationData.data, cityHallMRT);
  addMarkers(locationData.data, cityHallMRT);
}

async function BrasBasahLocations() {
  const response = await fetch(API_URL + "/getBrasBasahLocations", {
    method: "GET",
  });
  const locationData = await response.json();
  // console.log(typeof locationData.data);
  // console.log(locationData.data);
  clearFoodOptions();
  clearFilterOptions();
  displayLocationNames(locationData.data, brasBasahMRT);
  addMarkers(locationData.data, brasBasahMRT);
}

// Add location markers to the map
function addMarkers(locationData) {
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

    // Code to show marker on map
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
  // Create text to be displayed above the location names
  const locationText = document.getElementById("location-text");
  locationText.innerHTML =
    '<p>Click the icon below "<span class="show-food-options-text"> More Food >> </span>" for food options in each location </p>';

  // Get the container for location names and clear previous content
  const locationNamesContainer = document.getElementById("location-names");
  locationNamesContainer.innerHTML = "";

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
      // Scroll to the filter section
      document.getElementById("filter-text").scrollIntoView({
        behavior: "smooth",
      });
    });
    // Add the card to the container
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
  <div id="filter-list" class="col-12 col-md-6 col-lg-3 mb-2">  
    <label for="establishment-type-filter" class="filter-label">Establishment Type</label>
    <select id="establishment-type-filter" class="form-select">
      <option value="ALL">All Types</option>
      <option value="RESTAURANT">Restaurant</option>
      <option value="CAFE">Cafe</option>
      <option value="BAR">Bar</option>
      <option value="HAWKER STALL">Hawker</option>
      <option value="EATERY">Eatery</option>
      <option value="TAKEAWAY">Takeaway</option>
    </select>
    </div>

    <div class="col-12 col-md-6 col-lg-3 mb-2">
    <label for="cuisine-type-filter" class="filter-label">Cuisine</label>
    <select id="cuisine-type-filter" class="form-select">
      <option value="ALL">All Cuisines</option>
      <option value="CHINESE">Chinese</option>
      <option value="HALAL">Halal</option>
      <option value="INDIAN">Indian</option>
      <option value="LOCAL">Local</option>
      <option value="FAST FOOD">Fast Food</option>
      <option value="SALAD">Salad</option>
      <option value="WESTERN">Western</option>
      <option value="JAPANESE">Japanese</option>
      <option value="KOREAN">Korean</option>
      <option value="VEGETARIAN">Vegetarian</option>
      <option value="OTHERS">Others</option>
      <option value="DRINK">Drink</option>
      <option value="DESSERT">Dessert</option>
      <option value="BAKERY">Bakery</option>      
      <option value="PASTRIES & SNACKS">Pastries & Snacks</option>
    </select>
    </div>

    <div class="col-12 col-md-6 col-lg-3 mb-2">
    <label for="random-food-btn">Can't Decide</label>
    <button id="random-food-btn" class="random-food-btn btn-primary w-100">Randomly Suggest >></button>
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

// Create cards based on show-food-option button
function createCard(foodOption) {
  const card = document.createElement("div");
  card.classList.add("food-option-card", "mb-3");
  card.innerHTML = `

  <div class="food-option-card-header">
  <h6> ${foodOption.food_name} </h6>
  </div>

  <div class="food-option-card-type">
  ${foodOption.establishment_type}
  </div>

  <div class="food-option-card-cuisine">
  ${foodOption.cuisine}
  </div>

  <div class="food-option-card-body">
  <p> 📍: ${foodOption.stall_no} </p>
  <p> 👫🏻: ${foodOption.group_size} </p>
  <p> 🌐: ${
    foodOption.website
      ? `<a href="${foodOption.website}" target="_blank">${foodOption.food_name}</a>`
      : "null"
  } </p>
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
    alert("Sorry, food options for this location not added yet!");
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

// Function to clear filter options
function clearFilterOptions() {
  const filterOptions = document.getElementById("filter-list");
  filterOptions.innerHTML = "";
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
