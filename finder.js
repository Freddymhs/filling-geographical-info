const axios = require("axios");
const ports = require("./newlandports.json");
const timesPushed = require("./helper.js");

module.exports = completeLocationsWithGeoApi = async (apikey) => {
  const helpPrev = timesPushed.newIndex;
  const helpNew = timesPushed.newIndex;
  const inputApi = apikey || "e8b1e69edfc34515b73f8f1da0b6a19c"; //f.h@k.co
  timesPushed.prevIndex = timesPushed.newIndex;
  timesPushed.newIndex = timesPushed.prevIndex + timesPushed.maxQueryPerDay;

  //  qué buscar
  const inSearch = ports.slice(timesPushed.prevIndex, timesPushed.newIndex);

  // guardar
  const promises = [];
  for (let i = 0; i < inSearch.length; i++) {
    const { code, city, country } = inSearch[i];

    const url = `https://api.opencagedata.com/geocode/v1/json?q=${city},${country}&key=${inputApi}`;

    try {
      if (timesPushed.errorOccurred) {
        continue;
      }

      const response = await axios.get(url);
      const resultados = response.data.results;

      if (
        resultados.length > 0 ||
        (resultados[0] &&
          resultados[0].geometry &&
          resultados[0].geometry.lat &&
          resultados[0].geometry.lng)
      ) {
        const latitud = resultados[0].geometry.lat;
        const longitud = resultados[0].geometry.lng;

        promises.push({
          code,
          city,
          country,
          latitud,
          longitud,
        });
      }
    } catch (error) {
      console.error("error: " + error.message);
      timesPushed.prevIndex = helpPrev;
      timesPushed.newIndex = helpNew;
      timesPushed.errorOccurred = true;
    }
  }

  return Promise.all(promises).then((results) => {
    return results.filter(Boolean);
  });
};
