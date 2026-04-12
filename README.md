# 3N — Nursing Care Plans & Hospital Intelligence

> Plataforma SaaS de grado clínico y académico para la gestión integral de pacientes, elaboración de planes de cuidado estandarizados (NANDA·NIC·NOC) y análisis de inteligencia hospitalaria.

---

## 📋 Índice

- [Descripción](#descripción)
- [Arquitectura de Roles](#arquitectura-de-roles)
- [Funcionalidades Principales](#funcionalidades-principales)
- [Stack Tecnológico](#stack-tecnológico)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Instalación y Configuración](#instalación-y-configuración)
- [Esquema de Datos (Core)](#esquema-de-datos-core)
- [Paleta de Colores](#paleta-de-colores)

---

## 🏥 Descripción

**3N Nursing Care Plans** es una aplicación web diseñada para digitalizar, agilizar y estandarizar el proceso de atención de enfermería. Permite llevar un registro clínico exhaustivo, crear planes de cuidado con un algoritmo de sugerencias dinámicas (basado en la gravedad del paciente) y ofrece paneles de inteligencia institucional para la toma de decisiones directivas.

El sistema está construido bajo una arquitectura **Multi-Tenant** (Múltiples inquilinos), permitiendo que diferentes hospitales y clínicas operen en entornos de datos completamente aislados y seguros.

---

## 🔐 Arquitectura de Roles

El sistema utiliza control de acceso basado en roles (ACL) a través de JWT:

1. **Jefe de Enfermería (Tenant Admin):** Crea la "Institución" en el sistema. Puede invitar a enfermeros, gestionar su estado (activo/inactivo) y tiene acceso al **Dashboard de Inteligencia Institucional** (estadísticas macro del hospital).
2. **Enfermero Operativo:** Pertenece a una institución clínica. Gestiona pacientes, ingresos, signos vitales, notas de evolución y crea planes de cuidado. Tiene acceso a su propio panel de estadísticas de los pacientes a su cargo.
3. **Enfermero Independiente:** No está atado a un hospital. Utiliza el sistema para su práctica privada de forma aislada.
4. **SuperAdmin:** Mantenimiento técnico y gestión global de la plataforma.

---

## ✨ Funcionalidades Principales

### 📊 Inteligencia Institucional (Dashboards)
- **Tendencia de ingresos:** Gráficas de área con predicción de admisiones futuras mediante regresión lineal.
- **Demografía cruzada:** Pirámide de edades, cruce de edad por sexo biológico y distribución de tipos de sangre.
- **Perfil Clínico:** Top de diagnósticos NANDA más frecuentes, medicamentos más recetados y antecedentes patológicos predominantes.
- **Eficiencia:** Cálculo del tiempo promedio de estancia por servicio y tasa de reingresos (1, 2 o 3+ ingresos).

### 📋 Planes de Cuidado Estructurados
- **Buscador NANDA:** Integrado con taxonomía completa por dominios y clases.
- **Evaluación NOC:** Evaluación de indicadores en escala de Likert (1-5).
- **Algoritmo NIC Dinámico:** Las intervenciones sugeridas se ordenan automáticamente mediante un sistema de puntuación que evalúa la *gravedad* del paciente y la *afinidad* de la intervención (priorizando actividades de "manejo/control" en casos graves, y "educación/fomento" en pacientes estables).

### 👤 Gestión Clínica de Pacientes
- **Expediente detallado:** Alergias, medicación actual, antecedentes (patológicos, no patológicos, quirúrgicos).
- **Contexto social:** Hábitos de vida y red de apoyo/cuidados.
- **Historial:** Seguimiento histórico de Ingresos/Egresos.
- **Monitoreo de Signos Vitales:** Con alertas visuales de parámetros fuera de rango y captura de escala de dolor.
- **Evolución:** Registro de Notas de Enfermería.

---

## 🛠 Stack Tecnológico

| Capa | Tecnología |
|---|---|
| **Frontend** | React 18 + Vite |
| **Estilos / UI** | Tailwind CSS + FontAwesome |
| **Gráficas** | Recharts |
| **Routing** | React Router v6 |
| **Backend** | Node.js + Express |
| **Base de Datos**| MongoDB + Mongoose |
| **Seguridad** | JSON Web Tokens (JWT) + Bcryptjs |

---

## 📁 Estructura del Proyecto

```text
3n-nursing-care-plans/
├── backend/               # ⚙️ Servidor Express / API
│   ├── middleware/        # (auth.js, roles.js)
│   ├── models/            # (Esquemas de Mongoose)
│   ├── routes/            # (Endpoints REST)
│   └── index.js           # Punto de entrada del servidor
│
├── src/                   # 🖥️ Cliente React (Vite)
│   ├── assets/
│   ├── components/        # (Modales, NavMenu, Rutas protegidas)
│   ├── layouts/           # (AppLayout.jsx)
│   ├── utils/             # (api.js - Configuración de Axios)
│   └── views/             # (Dashboards, CarePlans, Formularios)
│
├── package.json           # Dependencias del Frontend
├── tailwind.config.js     # Configuración de estilos
└── vite.config.js         # Configuración del bundler
```

---

## 🚀 Instalación y Configuración

### 1. Clonar e Instalar
Asegúrate de tener Node.js ≥ 18 y MongoDB ejecutándose.

```bash
git clone [https://github.com/tu-usuario/3n-nursing-care-plans.git](https://github.com/tu-usuario/3n-nursing-care-plans.git)
cd 3n-nursing-care-plans

# Instalar dependencias del frontend (raíz)
npm install

# Instalar dependencias del backend
cd backend
npm install
```

### 2. Variables de Entorno

**En el Backend (`backend/.env`):**
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/3n-nursing
JWT_SECRET=tu_super_secreto_seguro_aqui
```

**En el Frontend (`/.env` en la raíz):**
```env
VITE_API_URL=http://localhost:5000
```

### 3. Ejecución en Desarrollo

Abre dos terminales:

```bash
# Terminal 1: Iniciar Backend
cd backend
npm run dev

# Terminal 2: Iniciar Frontend
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`.

---

## 🗄 Esquema de Datos (Core)

El sistema utiliza colecciones distribuidas para mantener la integridad de los datos por institución:

* **`Instituciones`**: Clínicas u hospitales creados en el sistema.
* **`Jefe_Enfermeria`**: Administradores enlazados a una Institución.
* **`Enfermeros`**: Personal operativo enlazado a una Institución (o `null` si son independientes).
* **`Pacientes`**: Información demográfica, expediente clínico y signos vitales.
* **`Admisiones`**: Historial de ingresos y egresos de un paciente.
* **`Planes_Cuidado`**: Documento unificado que guarda el estado de un paciente en una fecha específica, incluyendo el NANDA elegido, los NOCs evaluados, los NICs seleccionados y las notas de evolución.

---

## 🎨 Paleta de Colores

El sistema utiliza una interfaz limpia y clínica basada en las siguientes variables configuradas en Tailwind:

| Color | Hexadecimal | Uso principal |
| :--- | :--- | :--- |
| **Azul Marino** | `#0f3460` | Títulos, botones primarios, fondos de widgets fuertes. |
| **Teal (Turquesa)** | `#16a09e` | Acentos, gráficos, botones de éxito, iconos. |
| **Gris Fondo** | `#f9fafb` | Fondos de la aplicación y tarjetas. |
| **Rojo Alerta** | `#ef4444` | Signos vitales alterados, errores, botones destructivos. |

---

> *"La enfermería es un arte; y si se desea hacer de él un arte, requiere una devoción tan exclusiva, una preparación tan dura, como el trabajo de cualquier pintor o escultor."* — Florence Nightingale