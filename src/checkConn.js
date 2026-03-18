import axios from 'axios';

export const probarConexion = async () => {
  try {
    // Apuntamos a la URL de tu servidor Node
    const res = await axios.get('http://localhost:5000/api/check-db');
    console.log("%c🚀 BACKEND STATUS:", "color: green; font-weight: bold;", res.data.mensaje);
  } catch (err) {
    console.error("%c❌ BACKEND ERROR:", "color: red; font-weight: bold;", "No se pudo conectar al servidor. ¿Está encendido?");
  }
};