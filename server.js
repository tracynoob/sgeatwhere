require("dotenv").config();

// require("@supabase/supabase-js");
const { createClient } = require("@supabase/supabase-js");
const express = require("express");
const cors = require("cors");
const app = express();
const port = 3000;
const path = require("path");

// // Define the CORS options
const corsOptions = {
  credentials: true,
  origin: [
    "http://127.0.0.1:5501",
    "http://127.0.0.1:3000",
    "https://github.com/*",
    "https://ytwuhfytciwrngjtbqhh.supabase.co/*",
  ], // Whitelist the domains you want to allow
};
app.use(cors(corsOptions));

// app.use(cors()); // Enable all CORS requests
app.use(express.json());
app.use("/", express.static(path.join(__dirname, "public")));

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { flowType: "pkce" },
});

// Github sign-in => retrive callback url from supabase
app.get("/auth/signin", (req, res) => {
  function handleData(data) {
    console.log("📊", data);
    if (data.data.url) {
      res.redirect(data.data.url); //redirect frontend to go to callback url,
    } else {
      res.status(500).send("Error Obtainting OAuth URL");
    }
  }

  function handleError(error) {
    console.log("❌", error);
    console.error("Error during sign-in:", error);
  }

  const { data, error } = supabase.auth
    .signInWithOAuth({
      provider: "github",
      options: {
        redirectTo: "http://localhost:3000/auth/callback",
      },
    })
    .then(handleData, handleError);
});

// Github callback
app.get("/auth/callback", async function (req, res) {
  const code = req.query.code;
  const next = req.query.next ?? "/";

  if (code) {
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    console.log(data);
  }
  res.redirect(302, "http://127.0.0.1:5501/public/index.html");
});

// call supabase Locations table
app.get("/getBuonaVistaLocations", async (req, res) => {
  const { data: Locationdata, error } = await supabase
    .from("Locations")
    .select()
    .eq("mrt_station", "BUONA VISTA");
  // console.log(Locationdata);
  for (let data of Locationdata) {
    // means for each data in the defined variable "Locationdata", do xx
    const { data: imgData } = supabase.storage
      .from("locationimage")
      .getPublicUrl("BuonaVistaImage/" + data.location_name + ".jpg");
    data.imgURL = imgData.publicUrl;
  }
  res.send({ data: Locationdata });
});

app.get("/getClementiLocations", async (req, res) => {
  const { data: Locationdata, error } = await supabase
    .from("Locations")
    .select()
    .eq("mrt_station", "CLEMENTI");
  // console.log(Locationdata);
  for (let data of Locationdata) {
    // means for each data in the defined variable "Locationdata", do xx
    const { data: imgData } = supabase.storage
      .from("locationimage")
      .getPublicUrl("ClementiImage/" + data.location_name + ".jpg");
    data.imgURL = imgData.publicUrl;
  }
  res.send({ data: Locationdata });
});

app.get("/getCityHallLocations", async (req, res) => {
  const { data: Locationdata, error } = await supabase
    .from("Locations")
    .select()
    .eq("mrt_station", "CITY HALL");
  // console.log(Locationdata);
  for (let data of Locationdata) {
    // means for each data in the defined variable "Locationdata", do xx
    const { data: imgData } = supabase.storage
      .from("locationimage")
      .getPublicUrl("CityHallImage/" + data.location_name + ".jpg");
    data.imgURL = imgData.publicUrl;
  }
  res.send({ data: Locationdata });
});

app.get("/getBrasBasahLocations", async (req, res) => {
  const { data: Locationdata, error } = await supabase
    .from("Locations")
    .select()
    .eq("mrt_station", "BRAS BASAH");
  // console.log(Locationdata);
  for (let data of Locationdata) {
    // means for each data in the defined variable "Locationdata", do xx
    const { data: imgData } = supabase.storage
      .from("locationimage")
      .getPublicUrl("BrasBasahImage/" + data.location_name + ".jpg");
    data.imgURL = imgData.publicUrl;
  }
  res.send({ data: Locationdata });
});

app.post("/getFoodOptions", async (req, res) => {
  const { location } = req.body.location;
  const { data, error } = await supabase
    .from("FoodOptions")
    .select()
    .eq("location_name", req.body.location);
  if (error) {
    return res.status(500).send({ error: error.message });
  }
  res.send({ data });
});

// app.get("/displayLocationNames", (req, res) => {
//   res.send({
//     locationName: "Star Vista",
//     lat: 1.3070324456324165,
//     lng: 103.78842115309028,
//     address: "1 Vista Exchange Green, Singapore 138617",
//     category: "Shopping Mall",
//   });
// });

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
