const axios = require("axios");
const ports = require("./sinLocation.json");
const timesPushed = require("./helper.js");

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

module.exports = completeLocationsWithGeoApi = async (apikey, desdeInput) => {
  const desde = parseInt(desdeInput);
  const helpPrev = timesPushed.newIndex;
  const helpNew = timesPushed.newIndex;
  const inputApi = apikey || "cdf2cd81b287465f8a3e0629613044a0";
  timesPushed.prevIndex = desde > 0 ? desde : timesPushed.newIndex;
  timesPushed.newIndex = timesPushed.prevIndex + timesPushed.maxQueryPerDay;

  //  qué buscar
  const inSearch = ports.slice(timesPushed.prevIndex, timesPushed.newIndex);

  // guardar
  const promises = [];
  for (let i = 0; i < inSearch.length; i++) {
    const { name, city, country } = inSearch[i];

    // const url = `https://api.opencagedata.com/geocode/v1/json?q=${city},${country}&key=${inputApi}`;
    const url = `https://www.mapquestapi.com/geocoding/v1/address?key=${inputApi}&inFormat=kvp&outFormat=json&location=${city},${country}&thumbMaps=false`;

    try {
      if (timesPushed.errorOccurred) {
        continue;
      }
      if (i % 170 === 0 && i !== 0) {
        // Esperar 1 minuto cada 170 vueltas
        await wait(60000);
      }

      const response = await axios.get(url);
      const results = response.data.results;

      if (results.length > 0) {
        const location = results[0].locations[0];
        const latitud = location.latLng.lat;
        const longitud = location.latLng.lng;

        promises.push({
          code: name,
          city,
          country,
          location: {
            latitud,
            longitud,
          },
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
