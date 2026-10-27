# Guía de Arquitectura y Conexión de Foro Alterno (Estilo ForoParalelo)

Esta guía explica la estructura modular del proyecto, dónde configurar tus credenciales de Firebase y cómo activar **Cloud Firestore** y **Firebase Authentication** en la consola de Google Firebase.

---

## 1. Estructura de Archivos del Proyecto

```
├── firebase-applet-config.json    # Configuración de credenciales de Firebase
├── firestore.rules               # Reglas de seguridad de Firestore (hardened)
├── firebase-blueprint.json       # Esquema y modelo de entidades para la base de datos
├── index.html                    # Entry point con estilos, fuentes y meta tags
├── src/
│   ├── main.tsx                  # Punto de montaje de React 19
│   ├── App.tsx                   # Controlador principal de vistas, navegación y estados
│   ├── index.css                 # Importación de Tailwind CSS
│   ├── firebase/
│   │   └── config.ts             # Inicialización de Firebase, Firestore, Auth y error handling
│   ├── types/
│   │   └── forum.ts              # Interfaces TypeScript (Thread, Reply, UserProfile, Category)
│   ├── data/
│   │   ├── categories.ts         # Secciones de ForoParalelo (General, Motor, Informática, Ocio)
│   │   └── seedData.ts           # Hilos iniciales realistas y respuestas de demostración
│   ├── context/
│   │   └── AuthContext.tsx       # Proveedor de autenticación (Google Sign-In, Email/Pass, Perfil)
│   ├── services/
│   │   ├── forumService.ts       # Suscripciones en tiempo real a Firestore (onSnapshot, writes)
│   │   └── geminiService.ts      # Integración con Gemini 3.8 Flash, ForoBot y Google Search Grounding
│   └── components/
│       ├── Header.tsx            # Cabecera superior con logotipo, buscador y usuario
│       ├── SubNav.tsx            # Migas de pan (breadcrumbs) y pestañas de filtrado
│       ├── CategoryList.tsx      # Tabla índice de categorías y foros estilo ForoParalelo
│       ├── ThreadList.tsx        # Tabla de hilos con prefijos ([TEMA SERIO], [+HD]), visitas y replies
│       ├── ThreadDetail.tsx      # Visor de posts estilo vBulletin (autor a la izquierda, post a la derecha)
│       ├── CreateThreadModal.tsx # Modal para redactar nuevo hilo con prefijo y formato
│       ├── Sidebar.tsx           # Barra lateral (Estadísticas, Últimos posts, Widget ForoBot)
│       ├── ForoBotDrawer.tsx     # Chatbot conversacional con Gemini 3.8 Flash y Google Search
│       ├── AuthModal.tsx         # Ventana modal de inicio de sesión / registro con Google y Email
│       ├── ProfileModal.tsx      # Editor de avatar, título personalizado y firma forera
│       └── RulesModal.tsx        # Normas del foro y guía de la etiqueta [TEMA SERIO]
```

---

## 2. Dónde Sustituir el Objeto `firebaseConfig`

Tus credenciales de Firebase se encuentran en el archivo `/firebase-applet-config.json` o se pueden pasar directamente en `/src/firebase/config.ts`.

### Objeto de Configuración:
```json
{
  "projectId": "TU_FIREBASE_PROJECT_ID",
  "appId": "TU_APP_ID",
  "apiKey": "TU_API_KEY",
  "authDomain": "TU_PROJECT_ID.firebaseapp.com",
  "firestoreDatabaseId": "(default)",
  "storageBucket": "TU_PROJECT_ID.firebasestorage.app",
  "messagingSenderId": "TU_MESSAGING_SENDER_ID"
}
```

En `src/firebase/config.ts` se inicializa con:
```typescript
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
```

---

## 3. Cómo Activar Authentication en la Consola de Firebase

1. Entra en [Firebase Console](https://console.firebase.google.com/).
2. Selecciona o crea tu proyecto.
3. En el menú de navegación izquierdo, ve a **Compilación (Build) > Authentication**.
4. Haz clic en **Comenzar (Get started)**.
5. Ve a la pestaña **Método de inicio de sesión (Sign-in method)**:
   - **Google**: Haz clic en "Google", activa el interruptor **Habilitar**, selecciona tu correo de asistencia del proyecto y pulsa **Guardar**.
   - **Correo electrónico/contraseña**: Haz clic en "Correo electrónico/contraseña", activa **Habilitar** y pulsa **Guardar**.

---

## 4. Cómo Activar Cloud Firestore en la Consola de Firebase

1. En el menú izquierdo, ve a **Compilación (Build) > Firestore Database**.
2. Haz clic en **Crear base de datos (Create database)**.
3. Elige la ubicación de tu base de datos (por ejemplo, `europe-west3` o `us-central1`).
4. Selecciona **Modo de producción (Production mode)**.
5. Ve a la pestaña **Reglas (Rules)** y pega el contenido del archivo `firestore.rules` del proyecto.
6. Haz clic en **Publicar (Publish)**.

---

## 5. Colecciones Principales en Firestore

- **`user_profiles/{userId}`**: Datos públicos del forero (nombre para mostrar, avatar, firma, rango, mensajes escritos, dies recibidos).
- **`threads/{threadId}`**: Hilos del foro (título, categoría, prefijo, autor, contenido, replyCount, viewCount, likeCount, lastReplyAt).
- **`replies/{replyId}`**: Respuestas y mensajes dentro de cada hilo (threadId, authorName, content, quoteAuthor, quoteContent, likeCount, postNumber).
- **`likes/{likeId}`**: Registro de votos positivos (+1 / Mis dies) para evitar votos duplicados.
