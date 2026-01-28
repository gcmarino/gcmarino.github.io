# GC Marino — Sitio personal / Portafolio

Repositorio del sitio personal y portafolio de Gian Carlo Marino Polo, implementado con React + TypeScript y Vite.

Descripción

- Sitio web estático con secciones de perfil, tecnologías, proyectos y blog.
- Usa React para la interfaz, TypeScript para tipado, Vite como bundler y HMR.
- Incluye utilidades visuales: TailwindCSS, Framer Motion, Three.js y FontAwesome.

Tecnologías principales

- React 19 + TypeScript
- Vite
- TailwindCSS
- Framer Motion, Three.js
- FontAwesome

Instalación y uso

Requisitos:
- Node.js (v18+ recomendado)
- Yarn (opcional, el repo usa yarn en package.json)

Comandos comunes:

- Instalar dependencias:
  yarn install

- Ejecutar en desarrollo (con HMR):
  yarn dev

- Construir para producción:
  yarn build

- Previsualizar build de producción:
  yarn preview

- Linter:
  yarn lint

Despliegue

Opciones comunes:

- Firebase Hosting:
  1. Ejecutar `yarn build`.
  2. `firebase deploy --only hosting` (requiere tener firebase-tools configurado y autenticado).

- GitHub Pages / otra CDN:
  1. Ejecutar `yarn build`.
  2. Subir el contenido de la carpeta `dist/` al hosting elegido.

Estructura del proyecto

- src/        — código fuente (React, componentes, assets)
- public/     — archivos públicos estáticos
- docs/       — contenido adicional (si aplica)
- package.json— scripts y dependencias
- vite.config.ts

Notas para desarrolladores

- El meta y la estructura inicial del sitio se pueden encontrar en `index.html` y `src/`.
- Para añadir nuevas dependencias usar `yarn add <paquete>` y ampliar los tipos si es necesario.

Contribuciones

Se aceptan mejoras y correcciones por PR. Abrir issues para discutir cambios importantes.

Licencia

Este repositorio no especifica una licencia; añadir un fichero LICENSE si se desea publicar con una licencia explícita.

Contacto

Autor: Gian Carlo Marino Polo — ver el sitio para más información.

