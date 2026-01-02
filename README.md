# 🏈 Patriots Command Center

**Patriots Command Center** es una aplicación moderna tipo *dashboard* diseñada para los fanáticos de los New England Patriots. Permite seguir el calendario, ver resultados en tiempo real, consultar noticias y explorar la plantilla de jugadores en una interfaz rápida y oscura "Dark Mode".

![Project Status](https://img.shields.io/badge/status-active-success.svg)
![Next.js](https://img.shields.io/badge/Next.js-16.1-black)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0-38B2AC)

## 🚀 Funcionalidades

Esta aplicación va más allá de un simple calendario. Incluye:

- **📅 Gestión de Calendario:** Visualización inteligente de partidos pasados (History), el próximo juego (Next) y los futuros (Upcoming).
- **🔴 Modo "Live Game":** Panel en tiempo real que se activa durante los partidos con:
  - Marcador en vivo y reloj de juego.
  - Relato jugada a jugada (Play-by-Play).
  - Gráfico de tendencia de puntaje (Score Trend Chart) usando *Recharts*.
  - Líderes en estadísticas (Pases, Acarreos, Recepciones).
  - Probabilidades y apuestas (Spread, Moneyline, Predicción).
- **📰 Centro de Noticias:** Feed de las últimas noticias relacionadas con el equipo.
- **👥 Roster Interactivo:** Explorador de jugadores con buscador en tiempo real por nombre o posición.
- **🎨 UI Moderna:** Diseño responsivo con *Geist Font*, efectos de vidrio (glassmorphism) y animaciones fluidas.

## 🛠️ Tecnologías Utilizadas

Este proyecto utiliza las últimas tecnologías web disponibles:

- **Framework:** [Next.js 16.1](https://nextjs.org/) (App Router)
- **Lenguaje:** JavaScript (ES6+) / React 19
- **Estilos:** [Tailwind CSS v4](https://tailwindcss.com/)
- **Gráficos:** [Recharts](https://recharts.org/)
- **Fuentes:** Geist Sans & Mono (Vercel)
- **Datos:** Integración con [RapidAPI (NFL API)](https://rapidapi.com/)

## 📦 Instalación y Configuración Local

Si deseas correr este proyecto en tu máquina local:

1.  **Clona el repositorio:**
    ```bash
    git clone [https://github.com/dantedeagostino-dot/patriots-command-center.git](https://github.com/dantedeagostino-dot/patriots-command-center.git)
    cd patriots-command-center
    ```

2.  **Instala las dependencias:**
    ```bash
    npm install
    # o
    yarn install
    ```

3.  **Configura las Variables de Entorno:**
    Crea un archivo `.env.local` en la raíz del proyecto y agrega tus credenciales de RapidAPI (necesarias para obtener los datos):
    ```env
    RAPIDAPI_KEY=tu_api_key_aqui
    RAPIDAPI_HOST=nfl-api1.p.rapidapi.com
    ```

4.  **Inicia el servidor de desarrollo:**
    ```bash
    npm run dev
    ```
    Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

## 🚀 Despliegue (Deploy)

El proyecto está optimizado para ser desplegado en **Vercel**:

1.  Sube tu código a GitHub.
2.  Importa el proyecto en Vercel.
3.  **Importante:** En la configuración del proyecto en Vercel, ve a *Settings > Environment Variables* y agrega las mismas variables (`RAPIDAPI_KEY` y `RAPIDAPI_HOST`) que usaste localmente.
4.  ¡Listo! Vercel detectará Next.js y construirá la aplicación automáticamente.

---

Hecho con ❤️ por **Dante DeAgostino** para la #PatsNation.
