# 3N — Nursing Care Plans

> Plataforma de apoyo académico para estudiantes de enfermería: registro de pacientes, planes de cuidado con sugerencias inteligentes y taxonomía NANDA·NIC·NOC integrada.

---

## Índice

- [Descripción](#descripción)
- [Funcionalidades](#funcionalidades)
- [Stack tecnológico](#stack-tecnológico)
- [Estructura del proyecto](#estructura-del-proyecto)
- [Instalación](#instalación)
- [Variables de entorno](#variables-de-entorno)
- [Scripts disponibles](#scripts-disponibles)
- [Modelos de datos](#modelos-de-datos)
- [Paleta de colores](#paleta-de-colores)
- [Equipo](#equipo)

---

## Descripción

**3N Nursing Care Plans** es una aplicación web de uso académico pensada para que estudiantes de enfermería practiquen y agilicen la elaboración de planes de cuidado. Permite llevar un registro estructurado de pacientes, generar planes de cuidado con sugerencias basadas en diagnósticos, y consultar la taxonomía completa de **NANDA**, **NIC** y **NOC** desde un diccionario integrado.

---

## Funcionalidades

### 👤 Pacientes
- Registro de pacientes con datos demográficos (CURP, fecha de nacimiento, sexo, tipo de sangre)
- Expediente clínico: antecedentes patológicos, no patológicos y quirúrgicos
- Alergias y medicación actual
- Hábitos de vida y red de cuidados
- Historial de ingresos hospitalarios
- Vista en tarjetas o lista, con búsqueda en tiempo real, ordenamiento y paginación

### 📋 Planes de cuidado
- Creación de planes de cuidado vinculados a un paciente e ingreso
- Sugerencias de diagnósticos de enfermería basadas en la taxonomía NANDA
- Asignación de intervenciones NIC y resultados esperados NOC
- Seguimiento del estado del plan

### 📖 Diccionario taxonómico
- Consulta completa de diagnósticos **NANDA** (etiquetas, definiciones, características definitorias, factores relacionados)
- Intervenciones **NIC** con actividades sugeridas
- Resultados **NOC** con indicadores y escalas de medición
- Buscador por código, etiqueta o dominio

### 🔐 Autenticación
- Login con JWT
- Rutas protegidas por rol

---

## Stack tecnológico

| Capa | Tecnología |
|---|---|
| Frontend | React 18 + Vite |
| Estilos | Tailwind CSS |
| Routing | React Router v6 |
| HTTP client | Axios |
| Backend | Node.js + Express |
| Base de datos | MongoDB + Mongoose |
| Autenticación | JSON Web Tokens (JWT) |

---

## Estructura del proyecto

```
3n-nursing-care-plans/
├── client/                        # Frontend React
│   ├── public/
│   └── src/
│       ├── assets/
│       ├── components/
│       │   ├── auth/
│       │   │   └── ProtegerRutas.jsx
│       │   ├── care-plans/
│       │   │   └── CarePlanForm.jsx
│       │   ├── patients/
│       │   │   ├── PatientCards.jsx
│       │   │   ├── PatientForm.jsx
│       │   │   └── PatientList.jsx
│       │   └── shared/
│       │       └── Button.jsx
│       ├── layouts/
│       │   └── AppLayout.jsx
│       ├── router/
│       │   └── Router.jsx
│       └── views/
│           ├── LoginView.jsx
│           ├── DashBoardView.jsx
│           ├── PatientsView.jsx
│           ├── PatientProfileView.jsx
│           ├── CarePlansView.jsx
│           ├── DictionaryView.jsx
│           └── ProfileView.jsx
│
└── server/                        # Backend Express
    ├── models/
    │   ├── Patient.js
    │   ├── ClinicalRecord.js
    │   └── Admission.js
    ├── routes/
    │   └── patients.js
    ├── middleware/
    └── index.js
```

---

## Instalación

### Requisitos previos

- Node.js ≥ 18
- MongoDB (local o Atlas)

### 1. Clonar el repositorio

```bash
git clone https://github.com/tu-usuario/3n-nursing-care-plans.git
cd 3n-nursing-care-plans
```

### 2. Instalar dependencias

```bash
# Backend
cd server
npm install

# Frontend
cd ../client
npm install
```

### 3. Configurar variables de entorno

Crea un archivo `.env` en `/server` (ver sección [Variables de entorno](#variables-de-entorno)).

### 4. Ejecutar en desarrollo

```bash
# Backend (desde /server)
npm run dev

# Frontend (desde /client)
npm run dev
```

El backend corre en `http://localhost:5000` y el frontend en `http://localhost:5173`.

---

## Variables de entorno

Crea el archivo `server/.env` con las siguientes variables:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/3n-nursing
JWT_SECRET=tu_clave_secreta_aqui
```

> ⚠️ Nunca subas el archivo `.env` al repositorio. Está incluido en `.gitignore`.

---

## Scripts disponibles

### Backend (`/server`)

| Script | Descripción |
|---|---|
| `npm run dev` | Servidor con hot-reload (nodemon) |
| `npm start` | Servidor en producción |

### Frontend (`/client`)

| Script | Descripción |
|---|---|
| `npm run dev` | Vite dev server |
| `npm run build` | Build de producción |
| `npm run preview` | Preview del build |

---

## Modelos de datos

### Patient
```
nombre { nombre, apellidoPaterno, apellidoMaterno }
curp                   (único)
demograficos { fechaNacimiento, sexo, tipoSangre }
fechaRegistro
virtual: edad
```

### ClinicalRecord
```
pacienteId             (ref → Patient, único)
antecedentes { patologicos[], noPatologicos[], quirurgicos[] }
alergias { ninguna, medicamentos, alimentos, ambientales }
medicacionActual []
habitos { tabaquismo, alcoholismo, alimentacion }
redCuidados
```

### Admission
```
pacienteId             (ref → Patient)
ingreso { fecha, hora, servicio, cama, diagnosticoMedico }
egreso  { fecha, tipo, resumen }
estado                 (Activo | Egresado)
```

---

## Paleta de colores

| Token | Hex | Uso |
|---|---|---|
| Negro | `#050404` | Texto principal |
| Blanco | `#F7F6F6` | Fondo general |
| Café | `#473737` | Elementos secundarios |
| Gris | `#8B8888` | Texto muted, bordes |
| Rojo | `#C73E41` | Acento primario, alertas |
| Azul-teal | `#3EC6C3` | Fondo complementario, highlights |

---

## Equipo

Proyecto escolar desarrollado como herramienta de apoyo académico para estudiantes de enfermería.

---

> *"La enfermería es un arte; y si se desea hacer de él un arte, requiere una devoción tan exclusiva, una preparación tan dura, como el trabajo de cualquier pintor o escultor."* — Florence Nightingale