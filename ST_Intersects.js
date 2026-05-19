const uplUrl = "https://serviciosgis.catastrobogota.gov.co/arcgis/rest/services/ordenamientoterritorial/unidadplaneamientolocal/MapServer/0/query?where=1%3D1&outFields=NOMBRE&outSR=4326&geometryPrecision=5&f=geojson";

const metroUrl = "https://serviciosgis.catastrobogota.gov.co/arcgis/rest/services/movilidad/metrobogota/MapServer/1/query?where=1%3D1&outFields=NOMBRE&outSR=4326&geometryPrecision=5&f=geojson";

document.getElementById("mapa").textContent = "";
document.getElementById("mapa-interseccion").textContent = "";

const mapa = L.map("mapa", {
  preferCanvas: true
}).setView([4.65, -74.1], 11);

const mapaInterseccion = L.map("mapa-interseccion", {
  preferCanvas: true
}).setView([4.65, -74.1], 11);

async function cargarGeoJson(url) {
  const respuesta = await fetch(url);
  return respuesta.json();
}

function intersectaConMetro(upl, metro) {
  return metro.features.some(function (linea) {
    return turf.booleanIntersects(upl, linea);
  });
}

async function cargarMapa() {
  try {
    const datos = await Promise.all([
      cargarGeoJson(uplUrl),
      cargarGeoJson(metroUrl)
    ]);

    const upl = datos[0];
    const metro = datos[1];

    const capaUpl = L.geoJSON(upl, {
      style: {
        color: "#123c69",
        weight: 1,
        fillOpacity: 0.15
      }
    }).addTo(mapa);

    const capaMetro = L.geoJSON(metro, {
      style: {
        color: "#d71920",
        weight: 5
      }
    }).addTo(mapa);

    mapa.fitBounds(capaUpl.getBounds());
    capaMetro.bringToFront();

    const uplIntersectadas = {
      type: "FeatureCollection",
      features: upl.features.filter(function (feature) {
        return intersectaConMetro(feature, metro);
      })
    };

    const capaResultado = L.geoJSON(uplIntersectadas, {
      style: {
        color: "#0f766e",
        weight: 2,
        fillOpacity: 0.35
      }
    }).addTo(mapaInterseccion);

    L.geoJSON(metro, {
      style: {
        color: "#d71920",
        weight: 5
      }
    }).addTo(mapaInterseccion);

    mapaInterseccion.fitBounds(capaResultado.getBounds());
  } catch (error) {
    document.getElementById("mapa").textContent = "No fue posible cargar los datos.";
    document.getElementById("mapa-interseccion").textContent = "No fue posible cargar los datos.";
  }
}

cargarMapa();