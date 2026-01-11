# Guía de Despliegue - GlucoBot 2.0

Esta aplicación es una **Single Page Application (SPA)** construida con React y Vite.
Para subirla a internet, no necesitas un servidor NodeJS complejo, solo necesitas un servidor web estático (Apache, Nginx, o cualquier Hosting compartido).

## Paso 0: Subir a GitHub

Hemos inicializado tu repositorio localmente. Para subirlo a tu cuenta, ejecuta el siguiente comando en la terminal:

```bash
git push -u origin main
```

Te pedirá tu usuario y contraseña (o Token) de GitHub.

---

## Paso 1: Generar la Versión de Producción

Ya hemos ejecutado este paso, pero si necesitas actualizar cambios, corre siempre:

```bash
npm run build
```

Esto crea (o actualiza) la carpeta **`dist`** en tu proyecto.
Esta carpeta contiene **TODO** lo que necesitas subir.

---

## Opción A: Subir a Hosting Compartido (cPanel / FTP)
*Ideal si ya tienes un dominio como `indepsalud.cl` en un hosting tradicional.*

1.  Entra a tu **cPanel** > **Administrador de Archivos** (o usa FileZilla).
2.  Navega a la carpeta pública (usualmente `public_html` o la subcarpeta de tu subdominio).
3.  **BORRA** todo lo que haya ahí (haz backup si es necesario).
4.  **SUBE** todo el contenido **DENTRO** de la carpeta `dist`.
    *   ⚠️ **IMPORTANTE**: No subas la carpeta `dist` en sí. Abre `dist`, selecciona todos los archivos (`index.html`, `assets`, etc.) y sube ESOS archivos.
    *   Al final, deberías ver `index.html` directamente en tu `public_html`.

### Configuración para React Router (Importante)
Si usas Apache (hosting común), crea un archivo llamado `.htaccess` en la misma carpeta junto al `index.html` con este contenido para que las rutas (como `/weight` o `/profile`) funcionen al recargar:

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
```

---

## Opción B: Servidor VPS (Nginx)
*Si tienes tu propio servidor Linux (Ubuntu/Debian).*

1.  Sube los archivos de `dist` a `/var/www/glucobot`.
2.  Configura tu bloque de servidor Nginx:

```nginx
server {
    listen 80;
    server_name tu-dominio.com;
    root /var/www/glucobot;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

---

## Opción C: Vercel / Netlify (Moderno y Gratuito)
*La forma más rápida si no tienes servidor propio aún.*

1.  Instala Vercel CLI: `npm i -g vercel`
2.  Ejecuta: `vercel`
---

## Opción D: Despliegue en Render 🚀 (Recomendado)

Render es excelente para este tipo de apps. Sigue estos pasos:

1.  Sube tu código a **GitHub** (o GitLab).
2.  Entra a [dashboard.render.com](https://dashboard.render.com) y haz clic en **"New + "** -> **"Static Site"**.
3.  Conecta tu repositorio.
4.  Configura lo siguiente:
    *   **Name**: `glucobot` (o el que quieras)
    *   **Branch**: `main` (o tu rama principal)
    *   **Build Command**: `npm install && npm run build`
    *   **Publish Directory**: `dist`
5.  Haz clic en **"Create Static Site"**.

### ⚠️ Paso Crucial para Render (Rewrites)
Para que las rutas como `/weight` funcionen al recargar, debes agregar una regla de reescritura:

1.  Ve a la pestaña **"Redirects/Rewrites"** en tu panel de Render.
2.  Agrega una nueva regla:
    *   **Source**: `/*`
    *   **Destination**: `/index.html`
    *   **Action**: `Rewrite`
3.  Guarda los cambios.

¡Listo! Render te dará una URL (ej: `glucobot.onrender.com`) con HTTPS automático.
