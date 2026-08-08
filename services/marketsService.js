/**
 * Busca todos os supermercados cadastrados no OpenStreetMap na região
 */
async function fetchMarketsFromOSM(userLat, userLng, radiusKm = 10) {
  const radiusMeters = radiusKm * 1000;
  const query = `
    [out:json];
    (
      node["shop"="supermarket"](around:${radiusMeters},${userLat},${userLng});
      way["shop"="supermarket"](around:${radiusMeters},${userLat},${userLng});
    );
    out center;
  `;

  const url = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    return data.elements.map((item) => {
      const lat = item.lat || (item.center && item.center.lat);
      const lng = item.lon || (item.center && item.center.lon);
      
      return {
        id: item.id,
        name: item.tags.name || "Supermercado sem nome",
        network: item.tags.operator || item.tags.brand || "Independente",
        address: `${item.tags["addr:street"] || ""} ${item.tags["addr:housenumber"] || ""}`.trim() || "Endereço não informado",
        city: item.tags["addr:city"] || "",
        lat: lat,
        lng: lng
      };
    });
  } catch (error) {
    console.error("Erro ao consultar OpenStreetMap:", error);
    return [];
  }
}
