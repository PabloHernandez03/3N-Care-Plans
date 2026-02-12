# 📋 GUÍA DE INTEGRACIÓN - CHATBOT

## 📁 Estructura de Archivos

```
src/
├── components/chatbot/
│   └── Chatbot.jsx              ← Componente principal (plantilla flexible)
├── services/
│   └── chatbotService.js        ← API client para comunicarse con backend
├── data/
│   └── chatbotConfig.js         ← Configuración y templates
└── views/
    └── DashBoardView.jsx        ← Ejemplo de integración
```

---

## 🔌 Configuración de Variables de Entorno

Crea un archivo `.env` en la raíz de tu proyecto:

```env
VITE_API_URL=http://localhost:5000/api
```

O para producción:
```env
VITE_API_URL=https://tu-api.com/api
```

---

## 🚀 Cómo Usar el Chatbot

### Uso Básico

```jsx
import Chatbot from '../components/chatbot/Chatbot';

export default function MiVista() {
  return (
    <div>
      <h1>Mi Aplicación</h1>
      
      {/* Chatbot simple */}
      <Chatbot />
    </div>
  );
}
```

### Uso Avanzado con Contexto

```jsx
import Chatbot from '../components/chatbot/Chatbot';

export default function CarePlanPage({ patientId, patient }) {
  const handleSessionClose = (summary) => {
    console.log('Resultado de la sesión:', summary);
    // Enviar a tu backend, guardar en BD, etc.
  };

  return (
    <Chatbot
      patientId={patientId}
      patientContext={{
        name: patient.name,
        age: patient.age,
        diagnosis: patient.diagnosis,
        medicalHistory: patient.medicalHistory
      }}
      processType="care_plan_creation"
      onSessionClose={handleSessionClose}
      useLocalFallback={true}
    />
  );
}
```

---

## 📡 Rutas del Backend (API)

Tu backend debe implementar estos endpoints:

### 1. Inicializar Sesión
```http
POST /api/chatbot/session/init
Content-Type: application/json

{
  "context": {
    "patientId": "123",
    "processType": "care_plan_creation",
    "name": "Juan",
    "age": 65,
    "diagnosis": "Diabetes"
  },
  "timestamp": "2026-02-11T10:30:00Z"
}

RESPONSE (200):
{
  "sessionId": "sess_abc123xyz",
  "initialMessage": "Bienvenido. Voy a ayudarte a crear el plan de cuidado para Juan.",
  "decisionTree": { /* árbol de decisión */ }
}
```

### 2. Enviar Mensaje
```http
POST /api/chatbot/message
Content-Type: application/json

{
  "message": "El paciente tiene dolor intenso",
  "context": {
    "sessionId": "sess_abc123xyz",
    "patientId": "123"
  },
  "timestamp": "2026-02-11T10:31:00Z"
}

RESPONSE (200):
{
  "response": "He registrado que el paciente tiene dolor intenso...",
  "type": "question",
  "options": [
    {
      "id": "pain_1",
      "label": "Dolor agudo",
      "description": "Dolor repentino e intenso",
      "value": 10
    },
    {
      "id": "pain_2",
      "label": "Dolor crónico",
      "description": "Dolor persistente a largo plazo",
      "value": 8
    }
  ]
}
```

### 3. Registrar Decisión
```http
POST /api/chatbot/record-decision
Content-Type: application/json

{
  "sessionId": "sess_abc123xyz",
  "decisionPath": "pain_1",
  "payload": {
    "selectedLabel": "Dolor agudo",
    "selectedValue": 10
  },
  "timestamp": "2026-02-11T10:32:00Z"
}

RESPONSE (200):
{
  "message": "Decisión registrada. Siguiente paso...",
  "nextStep": "select_nic_intervention",
  "options": [ /* nuevas opciones */ ]
}
```

### 4. Obtener Resumen de Sesión
```http
GET /api/chatbot/session/sess_abc123xyz/summary

RESPONSE (200):
{
  "summary": {
    "processType": "care_plan_creation",
    "patientId": "123",
    "decisions": [ /* todas las decisiones */ ]
  },
  "recommendations": [ /* recomendaciones */ ]
}
```

### 5. Cerrar Sesión
```http
POST /api/chatbot/session/sess_abc123xyz/close
Content-Type: application/json

{
  "finalData": {
    "carePlan": { /* datos finales */ }
  },
  "timestamp": "2026-02-11T10:40:00Z"
}

RESPONSE (200):
{
  "success": true,
  "message": "Sesión cerrada exitosamente"
}
```

---

## 📊 Estructura de Árbol de Decisión Esperada

Tu backend debe devolver estructuras como esta:

```json
{
  "id": "diagnóstico_inicial",
  "type": "decision_node",
  "question": "¿Cuál es la preocupación principal?",
  "options": [
    {
      "id": "pain",
      "label": "Dolor",
      "description": "Dolor o malestar físico",
      "nextNode": "pain_assessment",
      "value": null
    },
    {
      "id": "emotional",
      "label": "Aspecto Emocional",
      "description": "Ansiedad, estrés o depresión",
      "nextNode": "emotional_assessment",
      "value": null
    }
  ]
}
```

---

## 🎯 Props del Componente Chatbot

| Prop | Tipo | Descripción | Requerido | Default |
|------|------|-------------|-----------|---------|
| `patientId` | string | ID del paciente | No | null |
| `patientContext` | object | Contexto del paciente (edad, diagnóstico, etc.) | No | {} |
| `processType` | string | Tipo de proceso ("care_plan_creation", "assessment", etc.) | No | "general_consultation" |
| `onSessionClose` | function | Callback cuando cierra la sesión | No | null |
| `useLocalFallback` | boolean | Usar BD local si API no responde | No | true |

---

## 🔄 Flujo de Comunicación

```
┌─────────────────────────────────────────────────────┐
│                     Frontend                         │
│                   (React Chatbot)                    │
└──────────┬──────────────────────────┬────────────────┘
           │                          │
    1. initSession()           2. sendMessage()
           │                          │
    ┌──────▼──────────────────────────▼──────┐
    │         chatbotService.js               │
    │   (llamadas a API + gestión errores)    │
    └──────┬──────────────────────────┬───────┘
           │                          │
    ┌──────▼──────────────────────────▼────────────────┐
    │              Backend (tu API)                     │
    │                                                   │
    │  POST /chatbot/session/init                       │
    │  POST /chatbot/message                           │
    │  POST /chatbot/record-decision                    │
    │  POST /chatbot/decision-options                   │
    │  GET  /chatbot/session/{id}/summary              │
    │  POST /chatbot/session/{id}/close                │
    │                                                   │
    └──────┬──────────────────────────┬─────────────────┘
           │                          │
    ┌──────▼──────────────────────────▼──────┐
    │  Sistema Experto (Árbol de Decisión)   │
    │  + Motor de Inferencia                 │
    │  + Base de Conocimiento                │
    └───────────────────────────────────────┘
```

---

## 🛠️ Ejemplo de Backend Básico (Node.js/Express)

```javascript
// backend/routes/chatbot.js
import express from 'express';
import chatbotController from '../controllers/chatbotController.js';

const router = express.Router();

router.post('/session/init', chatbotController.initSession);
router.post('/message', chatbotController.sendMessage);
router.post('/record-decision', chatbotController.recordDecision);
router.post('/decision-options', chatbotController.getDecisionOptions);
router.get('/session/:sessionId/summary', chatbotController.getSessionSummary);
router.post('/session/:sessionId/close', chatbotController.closeSession);

export default router;
```

```javascript
// backend/controllers/chatbotController.js
export default {
  async initSession(req, res) {
    const { context } = req.body;
    const sessionId = crypto.randomUUID();
    
    // Generar árbol de decisión basado en contexto
    const decisionTree = generateDecisionTree(context);
    
    res.json({
      sessionId,
      initialMessage: `Voy a ayudarte a crear un plan de cuidado...`,
      decisionTree
    });
  },

  async sendMessage(req, res) {
    const { message, context } = req.body;
    const { sessionId } = context;
    
    // Procesar mensaje con tu sistema experto
    const response = await expertSystem.processMessage(message, sessionId);
    
    res.json({
      response: response.text,
      type: response.type,
      options: response.options
    });
  },

  // ... más métodos
};
```

---

## ✅ Checklist de Integración

- [ ] Backend API configurado en `VITE_API_URL`
- [ ] Endpoints del chatbot implementados
- [ ] Sistema experto con árbol de decisión listo
- [ ] Pruebas de conexión API hechas
- [ ] Fallback local funcionando
- [ ] Manejo de errores en backend
- [ ] Persistencia de sesiones en BD
- [ ] Tests del flujo completo

---

## 🐛 Troubleshooting

### El chatbot no conecta con la API
1. Verifica que `VITE_API_URL` esté correcto
2. Revisa la consola del navegador (DevTools → Network)
3. Asegúrate que el backend está corriendo
4. Verifica CORS en el backend

### El fallback local no funciona
- Incluso sin API, debería mostrar "Modo Local"
- Si no aparece, revisa `useLocalFallback={true}`

### Las decisiones no se guardan
- Verifica que `sessionId` se crea correctamente
- Revisa los logs del backend
- Asegúrate que los datos se persistem en BD

---

## 📚 Referencias

- [Clasificación NIC](https://www.nursing.va.gov/teammodels/nic.asp)
- [Clasificación NOC](https://www.nursing.va.gov/outcomes/)
- [Árbol de decisión en sistemas expertos](https://es.wikipedia.org/wiki/%C3%81rbol_de_decisi%C3%B3n)

