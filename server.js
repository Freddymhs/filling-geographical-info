// node+express
const express = require("express");
const app = express();
// path
const path = require("path");

// incomplete data
const completeLocationsWithGeoApi = require("./finder.js");

// """"bd""""
const timesPushed = require("./helper.js");

// required middleware
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  timesPushed.errorOccurred = false;
  const indexPath = path.join(__dirname, "index.html");
  res.sendFile(indexPath);
});

// app.post("/add", async (req, res) => {
//   await completeLocationsWithGeoApi()
//     .then((data) => {
//       timesPushed.data.push(...data);
//     })
//     .then(() => timesPushed.count++)
//     .then(() => res.send(timesPushed.data));
// });

app.post("/push", async (req, res) => {
  const apikey = req.body.inputData;
  const newLocationsFound = await completeLocationsWithGeoApi(apikey);
  newLocationsFound[0]?.code && timesPushed.data.push(...newLocationsFound);

  timesPushed.count++;
  res.send(timesPushed.data);
});

app.listen(process.env.PORT || 3000, () => {
  console.log("Servidor en funcionamiento");
});
