// node+express
const express = require("express");
const app = express();
// path
const path = require("path");

// incomplete data
const completeLocationsWithGeoApi = require("./finder.js");

// """"bd""""
const timesPushed = require("./helper.js");
const { count, data } = timesPushed;

// required middleware
app.use(express.urlencoded({ extended: true }));

app.get("/", (_, res) => {
  timesPushed.errorOccurred = false;
  const indexPath = path.join(__dirname, "index.html");
  res.sendFile(indexPath);
});

app.post("/push", async (req, res) => {
  const apikey = req.body.inputData;
  const newLocationsFound = await completeLocationsWithGeoApi(apikey);
  newLocationsFound[0]?.code && timesPushed.data.push(...newLocationsFound);
  timesPushed.count++;

  res.send({
    count,
    data,
  });
});

app.post("/daily", async (_, res) => {
  await completeLocationsWithGeoApi()
    .then((data) => {
      timesPushed.data.push(...data);
    })
    .then(() => timesPushed.count++)
    .then(() =>
      res.send({
        count,
        data,
      })
    );
});

cron.schedule(
  "0 0 * * *",
  axios
    .post("http://localhost:3000/daily")
    .then(() => {
      console.log("cron ejecutado");
    })
    .catch((error) => {
      console.error("error cron", error.message);
    })
);

app.listen(process.env.PORT || 3000, () => {
  console.log("Servidor en funcionamiento");
});
