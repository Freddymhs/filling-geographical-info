// node+express ....
const express = require("express");
const app = express();
const cron = require("cron");

const axios = require("axios");

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
app.get("/now", (_, res) => {
  res.send({
    count,
    data,
  });
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

const job = new cron.CronJob(
  "26 11 * * *",
  () => {
    axios
      .post(
        "https://filling-geographical-info-e19ec34626c6.herokuapp.com/daily"
      )
      .then(() => {
        console.log("Cron ejecutado");
        console.log("o_o");
      })
      .catch((error) => {
        console.error("Error en cron", error.message);
      });
  },
  null,
  true,
  "America/Santiago"
);

job.start();
app.listen(process.env.PORT || 3000, () => {
  console.log("Servidor en funcionamiento");
});
