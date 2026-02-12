import React, { useState, useRef, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPaperPlane, faTimes, faComments, faSpinner } from '@fortawesome/free-solid-svg-icons';

/**
 * CHATBOT SISTEMA EXPERTO - PLANTILLA
 * 
 * Props:
 * - patientId: ID del paciente (opcional)
 * - patientContext: Contexto inicial del paciente
 * - processType: Tipo de proceso (ej: "care_plan_creation", "assessment")
 * - onSessionClose: Callback cuando cierra la sesión
 * - useLocalFallback: Si usar BD local cuando falle API (default: true)
 */

// Estados del chatbot
const CHATBOT_STATES = {
  IDLE: 'idle',
  LOADING: 'loading',
  WAITING_INPUT: 'waiting_input',
  PROCESSING: 'processing',
  ERROR: 'error',
  SESSION_COMPLETE: 'session_complete'
};

// Funciones de fallback
const fallbackFunctions = {
  initializeChatSession: async () => ({
    success: true,
    sessionId: 'local_' + Date.now(),
    initialMessage: '¡Hola! Soy tu asistente virtual. ¿En qué puedo ayudarte?'
  }),
  sendMessageToExpertSystem: async (message) => ({
    success: true,
    data: {
      response: `Recibí tu mensaje: ${message}`,
      type: 'response',
      options: []
    }
  }),
  recordDecision: async () => ({
    success: true,
    data: {
      message: 'Decisión registrada',
      options: []
    }
  }),
  getSessionSummary: async () => ({
    success: true,
    summary: { message: 'Sesión finalizada' }
  }),
  closeSession: async () => ({ success: true })
};

// Intenta importar servicios reales, sino usa fallback
let chatbotService = fallbackFunctions;
let configLoaded = false;

try {
  import('../../services/chatbotService').then(module => {
    chatbotService.sendMessageToExpertSystem = module.sendMessageToExpertSystem;
    chatbotService.initializeChatSession = module.initializeChatSession;
    chatbotService.recordDecision = module.recordDecision;
    chatbotService.getSessionSummary = module.getSessionSummary;
    chatbotService.closeSession = module.closeSession;
  }).catch(err => {
    console.warn('No se pudo cargar chatbotService:', err);
  });
} catch (error) {
  console.warn('Error cargando servicios externo:', error);
}

/**
 * CHATBOT SISTEMA EXPERTO - PLANTILLA
 * 
 * Props:
 * - patientId: ID del paciente (opcional)
 * - patientContext: Contexto inicial del paciente
 * - processType: Tipo de proceso (ej: "care_plan_creation", "assessment")
 * - onSessionClose: Callback cuando cierra la sesión
 * - useLocalFallback: Si usar BD local cuando falle API (default: true)
 */

export default function Chatbot({
  patientId = null,
  patientContext = {},
  processType = "general_consultation",
  onSessionClose = null,
  useLocalFallback = true
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [state, setState] = useState(CHATBOT_STATES.IDLE);
  const [sessionId, setSessionId] = useState(null);
  const [chatOptions, setChatOptions] = useState([]);
  const [useAPI, setUseAPI] = useState(true);
  
  const messagesEndRef = useRef(null);

  // Auto-scroll cuando hay nuevos mensajes
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Inicializar sesión al abrir el chatbot
  useEffect(() => {
    if (isOpen && !sessionId && messages.length === 0) {
      initSessionChat();
    }
  }, [isOpen]);

  /**
   * Inicializar la sesión del chatbot
   */
  const initSessionChat = async () => {
    setState(CHATBOT_STATES.LOADING);

    const context = {
      patientId,
      processType,
      ...patientContext,
      userAgent: navigator?.userAgent || 'unknown'
    };

    try {
      const result = await (chatbotService.initializeChatSession || fallbackFunctions.initializeChatSession)(context);

      if (result.success) {
        setSessionId(result.sessionId);
        setUseAPI(true);
        
        const welcomeMsg = {
          id: Date.now(),
          text: result.initialMessage || "¡Hola! Soy tu asistente experto. ¿Cómo puedo ayudarte?",
          sender: 'bot',
          timestamp: new Date(),
          type: 'info'
        };

        setMessages([welcomeMsg]);
        setState(CHATBOT_STATES.WAITING_INPUT);
      } else {
        throw new Error(result.error || 'Error inicializando sesión');
      }
    } catch (error) {
      console.warn('Error inicializando sesión:', error);
      
      if (useLocalFallback) {
        setUseAPI(false);
        const fallbackMsg = {
          id: Date.now(),
          text: "Hola, soy tu asistente. ¿En qué puedo ayudarte?",
          sender: 'bot',
          timestamp: new Date()
        };
        setMessages([fallbackMsg]);
        setState(CHATBOT_STATES.WAITING_INPUT);
      } else {
        const errorMsg = {
          id: Date.now(),
          text: `⚠️ Error al conectar: ${error.message}`,
          sender: 'bot',
          timestamp: new Date(),
          type: 'error'
        };
        setMessages([errorMsg]);
        setState(CHATBOT_STATES.ERROR);
      }
    }
  };

  /**
   * Enviar mensaje al sistema experto
   */
  const handleSend = async () => {
    if (!inputValue.trim()) return;

    const userMsg = {
      id: Date.now(),
      text: inputValue,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInputValue("");
    setState(CHATBOT_STATES.PROCESSING);

    if (useAPI && sessionId) {
      try {
        const result = await (chatbotService.sendMessageToExpertSystem || fallbackFunctions.sendMessageToExpertSystem)(inputValue, {
          sessionId,
          patientId,
          patientContext
        });

        if (result.success) {
          const botMsg = {
            id: Date.now() + 1,
            text: result.data.response || result.data.message,
            sender: 'bot',
            timestamp: new Date(),
            type: result.data.type || 'response',
            options: result.data.options || [],
            recommendations: result.data.recommendations
          };

          setMessages(prev => [...prev, botMsg]);
          setChatOptions(result.data.options || []);
          setState(CHATBOT_STATES.WAITING_INPUT);
        } else {
          throw new Error(result.error);
        }
      } catch (error) {
        const errorMsg = {
          id: Date.now() + 1,
          text: `Error: ${error.message}`,
          sender: 'bot',
          timestamp: new Date(),
          type: 'error'
        };
        setMessages(prev => [...prev, errorMsg]);
        setState(CHATBOT_STATES.ERROR);
      }
    } else {
      // Fallback local
      simulateLocalResponse(inputValue);
    }
  };

  /**
   * Simular respuesta local (fallback cuando no hay API)
   */
  const simulateLocalResponse = (userInput) => {
    setTimeout(() => {
      const botMsg = {
        id: Date.now() + 1,
        text: `Recibí tu mensaje: "${userInput}". (Modo local - esperando conexión con sistema experto)`,
        sender: 'bot',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMsg]);
      setState(CHATBOT_STATES.WAITING_INPUT);
    }, 600);
  };

  /**
   * Registrar una decisión (opción elegida)
   */
  const handleOptionClick = async (option) => {
    const userMsg = {
      id: Date.now(),
      text: option.label,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setChatOptions([]);
    setState(CHATBOT_STATES.PROCESSING);

    if (useAPI && sessionId) {
      try {
        const result = await (chatbotService.recordDecision || fallbackFunctions.recordDecision)(sessionId, option.id, {
          selectedLabel: option.label,
          selectedValue: option.value
        });

        if (result.success) {
          const botMsg = {
            id: Date.now() + 1,
            text: result.data.message || result.nextMessage,
            sender: 'bot',
            timestamp: new Date(),
            options: result.data.options || []
          };

          setMessages(prev => [...prev, botMsg]);
          setChatOptions(result.data.options || []);
          setState(CHATBOT_STATES.WAITING_INPUT);
        }
      } catch (error) {
        console.error('Error registrando decisión:', error);
        setState(CHATBOT_STATES.ERROR);
      }
    }
  };

  /**
   * Cerrar sesión
   */
  const handleCloseChat = async () => {
    if (useAPI && sessionId) {
      try {
        const summary = await (chatbotService.getSessionSummary || fallbackFunctions.getSessionSummary)(sessionId);
        await (chatbotService.closeSession || fallbackFunctions.closeSession)(sessionId, summary.data);

        if (onSessionClose && summary.success) {
          onSessionClose(summary.data || summary.summary);
        }
      } catch (error) {
        console.error('Error cerrando sesión:', error);
      }
    }

    setIsOpen(false);
    setMessages([]);
    setSessionId(null);
    setState(CHATBOT_STATES.IDLE);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Botón flotante cuando está cerrado
  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 bg-blue-600 hover:bg-blue-700 text-white rounded-full p-4 shadow-lg transition-all duration-200 hover:scale-110 z-40"
        title="Abrir Sistema Experto"
      >
        <FontAwesomeIcon icon={faComments} size="lg" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 w-96 h-screen-75 bg-white rounded-lg shadow-2xl flex flex-col overflow-hidden z-50 animate-in">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 flex justify-between items-center">
        <div>
          <h3 className="font-bold text-lg">Asistente</h3>
          <p className="text-xs text-blue-100">
            {useAPI ? (sessionId ? "Conectado" : "Conectando...") : "Modo Local"}
          </p>
        </div>
        <button
          onClick={handleCloseChat}
          className="hover:bg-blue-800 p-1 rounded transition-colors"
          title="Cerrar"
        >
          <FontAwesomeIcon icon={faTimes} />
        </button>
      </div>

      {/* Mensajes */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs px-4 py-2 rounded-lg ${
                msg.sender === 'user'
                  ? 'bg-blue-600 text-white rounded-br-none'
                  : msg.type === 'error'
                  ? 'bg-red-100 text-red-800 rounded-bl-none'
                  : 'bg-gray-300 text-gray-800 rounded-bl-none'
              }`}
            >
              <p className="text-sm whitespace-pre-wrap break-words">{msg.text}</p>
              <span className={`text-xs block mt-1 ${msg.sender === 'user' ? 'text-blue-100' : 'text-gray-600'}`}>
                {msg.timestamp.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>
        ))}

        {state === CHATBOT_STATES.PROCESSING && (
          <div className="flex justify-start">
            <div className="bg-gray-300 text-gray-800 px-4 py-2 rounded-lg rounded-bl-none">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-gray-600 rounded-full animate-bounce"></span>
                <span className="w-2 h-2 bg-gray-600 rounded-full animate-bounce delay-100"></span>
                <span className="w-2 h-2 bg-gray-600 rounded-full animate-bounce delay-200"></span>
              </div>
            </div>
          </div>
        )}

        {/* Opciones de decisión */}
        {chatOptions.length > 0 && state !== CHATBOT_STATES.PROCESSING && (
          <div className="flex justify-start">
            <div className="space-y-2">
              {chatOptions.map((option) => (
                <button
                  key={option.id}
                  onClick={() => handleOptionClick(option)}
                  className="block w-full text-left bg-blue-100 hover:bg-blue-200 text-blue-900 px-3 py-2 rounded border border-blue-300 transition-colors text-sm"
                >
                  <span className="font-semibold">{option.label}</span>
                  {option.description && (
                    <p className="text-xs text-blue-700 mt-1">{option.description}</p>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-gray-200 p-4 bg-white">
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Escribe tu pregunta..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyPress}
            disabled={state === CHATBOT_STATES.PROCESSING || state === CHATBOT_STATES.LOADING}
            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 disabled:bg-gray-100"
          />
          <button
            onClick={handleSend}
            disabled={state === CHATBOT_STATES.PROCESSING || state === CHATBOT_STATES.LOADING || !inputValue.trim()}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg px-4 py-2 transition-colors flex items-center gap-2"
          >
            <FontAwesomeIcon icon={state === CHATBOT_STATES.PROCESSING ? faSpinner : faPaperPlane} size="sm" spin={state === CHATBOT_STATES.PROCESSING} />
          </button>
        </div>
        {!useAPI && (
          <p className="text-xs text-amber-600 mt-2">⚠️ API no disponible - Modo local</p>
        )}
      </div>
    </div>
  );
}
