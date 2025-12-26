/**
 * Utilidades de depuración para autenticación
 */

export const debugAuth = () => {
  console.log('=== 🔍 DEBUG AUTH ===');
  
  // Verificar localStorage
  const userStr = localStorage.getItem('user');
  console.log('1. Usuario en localStorage:', userStr ? 'SÍ' : 'NO');
  
  if (userStr) {
    try {
      const user = JSON.parse(userStr);
      console.log('2. Usuario parseado exitosamente');
      console.log('3. Tiene token:', !!user?.token);
      console.log('4. Longitud del token:', user?.token?.length || 0);
      console.log('5. Role del usuario:', user?.role);
      console.log('6. Email del usuario:', user?.email);
      console.log('7. Keys del objeto:', Object.keys(user));
      
      // Mostrar primeros caracteres del token
      if (user?.token) {
        console.log('8. Token (primeros 30 chars):', user.token.substring(0, 30) + '...');
      }
      
      // Verificar estructura anidada
      if (user?.data) {
        console.log('⚠️ Estructura anidada detectada');
        console.log('   data.token:', !!user.data.token);
      }
    } catch (error) {
      console.error('❌ Error al parsear usuario:', error);
    }
  }
  
  console.log('=== FIN DEBUG AUTH ===');
};

/**
 * Verificar que el token esté disponible y sea válido
 */
export const verifyToken = () => {
  const userStr = localStorage.getItem('user');
  
  if (!userStr) {
    return { valid: false, reason: 'No hay usuario en localStorage' };
  }
  
  try {
    const user = JSON.parse(userStr);
    
    // Verificar estructura plana
    if (user?.token) {
      return { 
        valid: true, 
        token: user.token,
        structure: 'flat'
      };
    }
    
    // Verificar estructura anidada
    if (user?.data?.token) {
      return { 
        valid: true, 
        token: user.data.token,
        structure: 'nested'
      };
    }
    
    return { valid: false, reason: 'Token no encontrado en ninguna estructura' };
  } catch (error) {
    return { valid: false, reason: 'Error al parsear usuario', error };
  }
};

/**
 * Limpiar autenticación (útil para debugging)
 */
export const clearAuth = () => {
  localStorage.removeItem('user');
  console.log('✅ Autenticación limpiada');
};

/**
 * Hacer una petición de prueba al perfil para diagnosticar
 */
export const testProfileRequest = async () => {
  console.log('=== 🧪 TEST PROFILE REQUEST ===');
  
  const userStr = localStorage.getItem('user');
  if (!userStr) {
    console.error('❌ No hay usuario en localStorage');
    return;
  }
  
  const user = JSON.parse(userStr);
  const token = user?.token || user?.data?.token;
  
  if (!token) {
    console.error('❌ No se encontró token');
    return;
  }
  
  console.log('🔐 Token a enviar (COMPLETO):', token);
  console.log('🔐 Token length:', token.length);
  console.log('🔐 Authorization header:', `Bearer ${token}`);
  
  // Endpoint correcto según API_DOCUMENTATION.md línea 251
  const apiUrl = 'https://remeraslisas-backend.onrender.com/api/auth/profile';
  console.log('🌐 URL de la petición:', apiUrl);
  
  try {
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('📡 Status:', response.status);
    console.log('📡 Status Text:', response.statusText);
    console.log('📡 Headers:', Object.fromEntries(response.headers.entries()));
    
    const data = await response.text();
    console.log('📡 Response:', data);
    
    if (response.ok) {
      console.log('✅ Petición exitosa!');
      try {
        const json = JSON.parse(data);
        console.log('📦 Data parseada:', json);
      } catch (e) {
        console.log('⚠️ Respuesta no es JSON');
      }
    } else {
      console.error('❌ Petición falló');
    }
  } catch (error) {
    console.error('❌ Error en la petición:', error);
  }
  
  console.log('=== FIN TEST ===');
};

// Exponer funciones en window para debugging fácil desde la consola
if (typeof window !== 'undefined') {
  window.debugAuth = debugAuth;
  window.verifyToken = verifyToken;
  window.clearAuth = clearAuth;
  window.testProfileRequest = testProfileRequest;
}

export default {
  debugAuth,
  verifyToken,
  clearAuth,
  testProfileRequest
};

