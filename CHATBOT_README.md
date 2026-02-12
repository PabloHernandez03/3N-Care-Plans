# 🤖 Chatbot

## Descripción Rápida

Chatbot modular y flexible diseñado como **plantilla** para integrar un **sistema experto** basado en **árbol de decisión**.

- ✅ **Flotante reutilizable** - Se puede usar en cualquier vista
- ✅ **API-ready** - Preparado para comunicarse con backend
- ✅ **Árbol de decisión** - Soporta flujos complejos de decisiones
- ✅ **Fallback local** - Funciona incluso sin API
- ✅ **Historial de sesiones** - Guarda decisiones y contexto

---

## 📁 Archivos Principales

| Archivo | Descripción |
|---------|-------------|
| [src/components/chatbot/Chatbot.jsx](src/components/chatbot/Chatbot.jsx) | Componente principal |
| [src/services/chatbotService.js](src/services/chatbotService.js) | Cliente API |
| [src/data/chatbotConfig.js](src/data/chatbotConfig.js) | Configuración y templates |
| [CHATBOT_INTEGRATION_GUIDE.md](CHATBOT_INTEGRATION_GUIDE.md) | Guía completa de integración |
| [CHATBOT_EXAMPLES.jsx](CHATBOT_EXAMPLES.jsx) | 8 ejemplos de uso |

---

## 🚀 Uso Rápido

### Básico (Sin contexto)
```jsx
<Chatbot />
```

### Con Contexto de Paciente
```jsx
<Chatbot
  patientId="12345"
  patientContext={{
    name: "Juan García",
    age: 65,
    diagnosis: "Diabetes"
  }}
  processType="care_plan_creation"
  onSessionClose={(plan) => savePlan(plan)}
/>
```

---

## 🔌 Backend Requerido

Tu backend debe implementar estos endpoints:

```javascript
POST   /api/chatbot/session/init              // Iniciar sesión
POST   /api/chatbot/message                   // Enviar mensaje
POST   /api/chatbot/record-decision           // Registrar decisión
POST   /api/chatbot/decision-options          // Obtener opciones
GET    /api/chatbot/session/:id/summary       // Obtener resumen
POST   /api/chatbot/session/:id/close         // Cerrar sesión
```

📖 Ver [CHATBOT_INTEGRATION_GUIDE.md](CHATBOT_INTEGRATION_GUIDE.md) para estructura detallada

---

## 🎯 Props del Componente

| Prop | Tipo | Default | Descripción |
|------|------|---------|-------------|
| `patientId` | string | null | ID del paciente |
| `patientContext` | object | {} | Datos del paciente |
| `processType` | string | "general_consultation" | Tipo de proceso |
| `onSessionClose` | function | null | Callback al cerrar |
| `useLocalFallback` | boolean | true | Usar BD local si falla API |

---

## 🔄 Flujo de Conversación

```
1. Usuario abre chatbot
   ↓
2. Sistema inicializa sesión con contexto
   ↓
3. Backend devuelve mensaje inicial + árbol de decisión
   ↓
4. Usuario escribe o elige opción
   ↓
5. Frontend envía mensaje + contexto
   ↓
6. Backend procesa con sistema experto
   ↓
7. Devuelve respuesta + nuevas opciones
   ↓
8. [Repetir 4-7] O Usuario cierra
   ↓
9. Sistema guarda sesión y envía resumen
```

---

## 💾 Estructura de Datos Esperada

### Respuesta del Backend
```json
{
  "response": "El paciente presenta dolor intenso...",
  "type": "question",
  "options": [
    {
      "id": "pain_1",
      "label": "Dolor agudo",
      "description": "Dolor repentino",
      "value": 10
    }
  ],
  "recommendations": ["Manejo del dolor", "Apoyo emocional"]
}
```

### Resumen al Cerrar
```json
{
  "sessionId": "sess_123",
  "processType": "care_plan_creation",
  "decisions": [],
  "recommendations": [],
  "data": {}
}
```

---

## 🛠️ Configuración

### Archivo .env
```env
VITE_API_URL=http://localhost:5000/api
```

---

## 📚 Ejemplos

Consulta [CHATBOT_EXAMPLES.jsx](CHATBOT_EXAMPLES.jsx) para ver cómo integrar el chatbot.

---

## 🔧 States del Chatbot

```javascript
- "idle"                  // Inactivo
- "loading"              // Cargando sesión
- "waiting_input"        // Esperando entrada del usuario
- "processing"           // Procesando respuesta
- "error"                // Estado de error
- "session_complete"     // Sesión completa
```

---

## 🎨 Estilos

- ✅ Tailwind CSS integrado
- ✅ Tema azul/gris por defecto
- ✅ Responsive (móvil friendly)
- ✅ Animaciones suaves

---

## ⚠️ Modo Fallback

Si la API no está disponible:
- Chatbot sigue funcionando localmente
- Muestra "Modo Local" en el header
- Respuestas simuladas en fallback
- Ideal para desarrollo sin backend

---

## 🐛 Troubleshooting

**Q: El chatbot no conecta**
- Verifica `VITE_API_URL` en .env
- Confirma que el backend está corriendo
- Revisa CORS

**Q: No se guardan las decisiones**
- Verifica que `sessionId` se envíe correctamente
- Revisa logs del backend

**Q: Fallback local no funciona**
- Asegúrate que `useLocalFallback={true}`
- Revisa la consola para errores

---

## 📖 Para Más Información

- [Guía Completa de Integración](CHATBOT_INTEGRATION_GUIDE.md)
- [8 Ejemplos de Uso](CHATBOT_EXAMPLES.jsx)
- [Archivo de Configuración](src/data/chatbotConfig.js)

---

## 📝 Checklist de Implementación

- [ ] Backend API implementado
- [ ] 6 endpoints creados
- [ ] Árbol de decisión configurado
- [ ] .env con VITE_API_URL
- [ ] Tests de conexión
- [ ] Persistencia de sesiones
- [ ] Manejo de errores
- [ ] Árbol de decisión funcional

---

## 🎯 Próximos Pasos

1. Implementa los 6 endpoints en tu backend
2. Configura el árbol de decisión
3. Prueba la conexión API
4. Adapta la estructura de respuestas según tu lógica
5. Integra con tu sistema experto

¡Listo! 🚀

