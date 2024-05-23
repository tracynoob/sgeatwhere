require("dotenv").config();

// require("@supabase/supabase-js");
const { createClient } = require("@supabase/supabase-js");
const express = require("express");
const cors = require("cors");
const app = express();
const port = 3000;

// // Define the CORS options
// const corsOptions = {
//   credentials: true,
//   origin: ["http://localhost:5501", "http://localhost:80"], // Whitelist the domains you want to allow
// };

app.use(cors()); // Use the cors middleware with your options

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

app.use(express.json());

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

app.get("/getQueenstownLocations", async (req, res) => {
  const { data: Locationdata, error } = await supabase
    .from("Locations")
    .select()
    .eq("mrt_station", "QUEENSTOWN");
  // console.log(Locationdata);
  for (let data of Locationdata) {
    // means for each data in the defined variable "Locationdata", do xx
    const { data: imgData } = supabase.storage
      .from("locationimage")
      .getPublicUrl("QueenstownImage/" + data.location_name + ".jpg");
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

app.get("/", (req, res) => {
  res.send("Hello World!");
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
