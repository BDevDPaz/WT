// Servicio para convertir Coordenadas -> Dirección
// Usa OpenStreetMap (Nominatim) - Gratuito, sin API Key.

export const getAddressFromCoordinates = async (latitude, longitude) => {
  try {
    // 1. Validar coordenadas
    if (!latitude || !longitude) return "Ubicación desconocida";

    // 2. Construir URL (Zoom 18 es nivel calle)
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`;

    // 3. Petición HTTP
    // IMPORTANTE: OSM requiere un User-Agent para identificar la app
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'WorkTrackerApp/1.0'
      }
    });

    const data = await response.json();

    if (data && data.display_name) {
      // Retornamos la dirección legible encontrada
      return data.display_name;
    }

    // Si la API responde pero no encuentra dirección, devolvemos coordenadas
    return `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`;

  } catch (error) {
    // 4. Manejo de Errores / Offline
    // Si no hay internet, devolvemos las coordenadas para no perder el dato.
    console.log("Geocoding Error (Posiblemente Offline):", error.message);
    return `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`;
  }
};
