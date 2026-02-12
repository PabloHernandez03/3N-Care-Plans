// servicio para comunicarme con la API del backend
import axios from 'axios';

// Configurar URL base de la API
const API_BASE_URL = process.env.VITE_API_URL || 'http://localhost:5000/api';

// Cliente axios personalizado
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  }
});

/**
 * Enviar mensaje al chatbot del backend (Sistema Experto)
 * @param {string} message - Mensaje del usuario
 * @param {object} context - Contexto adicional (paciente, datos previos, etc.)
 * @returns {Promise<object>} Respuesta del sistema experto
 */
export const sendMessageToExpertSystem = async (message, context = {}) => {
  try {
    const response = await apiClient.post('/chatbot/message', {
      message,
      context,
      timestamp: new Date().toISOString()
    });

    return {
      success: true,
      data: response.data,
      status: response.status
    };
  } catch (error) {
    console.error('Error communicating with expert system:', error);
    return {
      success: false,
      error: error.response?.data?.message || error.message,
      status: error.response?.status
    };
  }
};

/**
 * Iniciar nueva sesión de chat con el sistema experto
 * @param {object} initialContext - Contexto inicial (paciente, proceso, etc.)
 * @returns {Promise<object>} Sesión inicializada
 */
export const initializeChatSession = async (initialContext = {}) => {
  try {
    const response = await apiClient.post('/chatbot/session/init', {
      context: initialContext,
      timestamp: new Date().toISOString()
    });

    return {
      success: true,
      sessionId: response.data.sessionId,
      initialMessage: response.data.initialMessage,
      data: response.data
    };
  } catch (error) {
    console.error('Error initializing chat session:', error);
    return {
      success: false,
      error: error.response?.data?.message || error.message
    };
  }
};

/**
 * Obtener opciones de decisión/recomendaciones del sistema experto
 * @param {string} sessionId - ID de la sesión actual
 * @param {string} currentState - Estado actual del árbol de decisión
 * @returns {Promise<object>} Opciones de decisión
 */
export const getDecisionOptions = async (sessionId, currentState) => {
  try {
    const response = await apiClient.post('/chatbot/decision-options', {
      sessionId,
      currentState,
      timestamp: new Date().toISOString()
    });

    return {
      success: true,
      options: response.data.options,
      recommendations: response.data.recommendations,
      data: response.data
    };
  } catch (error) {
    console.error('Error fetching decision options:', error);
    return {
      success: false,
      error: error.response?.data?.message || error.message
    };
  }
};

/**
 * Registrar decisión en el árbol de decisión
 * @param {string} sessionId - ID de la sesión
 * @param {string} decisionPath - Ruta de decisión elegida
 * @param {object} payload - Datos de la decisión
 * @returns {Promise<object>} Confirmación y siguiente paso
 */
export const recordDecision = async (sessionId, decisionPath, payload = {}) => {
  try {
    const response = await apiClient.post('/chatbot/record-decision', {
      sessionId,
      decisionPath,
      payload,
      timestamp: new Date().toISOString()
    });

    return {
      success: true,
      nextStep: response.data.nextStep,
      nextMessage: response.data.nextMessage,
      data: response.data
    };
  } catch (error) {
    console.error('Error recording decision:', error);
    return {
      success: false,
      error: error.response?.data?.message || error.message
    };
  }
};

/**
 * Obtener resumen o resultado del sistema experto
 * @param {string} sessionId - ID de la sesión
 * @returns {Promise<object>} Resumen/resultado
 */
export const getSessionSummary = async (sessionId) => {
  try {
    const response = await apiClient.get(`/chatbot/session/${sessionId}/summary`);

    return {
      success: true,
      summary: response.data.summary,
      recommendations: response.data.recommendations,
      data: response.data
    };
  } catch (error) {
    console.error('Error fetching session summary:', error);
    return {
      success: false,
      error: error.response?.data?.message || error.message
    };
  }
};

/**
 * Cerrar la sesión del chatbot
 * @param {string} sessionId - ID de la sesión
 * @param {object} finalData - Datos finales a guardar
 * @returns {Promise<object>} Confirmación
 */
export const closeSession = async (sessionId, finalData = {}) => {
  try {
    const response = await apiClient.post(`/chatbot/session/${sessionId}/close`, {
      finalData,
      timestamp: new Date().toISOString()
    });

    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    console.error('Error closing session:', error);
    return {
      success: false,
      error: error.response?.data?.message || error.message
    };
  }
};

export default {
  sendMessageToExpertSystem,
  initializeChatSession,
  getDecisionOptions,
  recordDecision,
  getSessionSummary,
  closeSession
};
