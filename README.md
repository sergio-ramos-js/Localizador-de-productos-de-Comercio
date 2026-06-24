# Mapa Tienda

Sistema web para almacenes y supermercados pequeños/medianos. Permite diseñar el mapa de góndolas, cargar productos con sus ubicaciones y ofrecer a los clientes un buscador público accesible por QR.

## Funcionalidades

| Módulo | Ruta | Descripción |
|--------|------|-------------|
| Buscador público | `/buscar` | Los clientes buscan un producto y ven en qué góndola está |
| Diseñador de mapa | `/admin/gondolas` | Crear, mover, editar y eliminar góndolas |
| Gestor de productos | `/admin/productos` | CRUD de productos con múltiples ubicaciones |
| Generador QR | `/admin/qr` | QR que apunta al buscador público |
| Panel admin | `/dashboard` | Acceso tras login |

## Stack

- **Backend:** Laravel 13, PHP 8.3+
- **Frontend:** React 19, Inertia.js, TypeScript, Tailwind CSS 4
- **Auth:** Laravel Fortify (login, reset password, 2FA opcional)
- **Base de datos:** MySQL o PostgreSQL en producción (SQLite solo para desarrollo)

## Requisitos del servidor

- PHP 8.3 o superior (extensiones: `pdo`, `mbstring`, `openssl`, `tokenizer`, `xml`, `ctype`, `json`, `bcmath`)
- Composer 2
- Node.js 22+ y npm
- MySQL 8+ o PostgreSQL 15+
- Servidor web (Nginx/Apache) con HTTPS

---

## Desarrollo local

```bash
# Clonar e instalar dependencias
composer install
cp .env.example .env
php artisan key:generate

# Migrar y (opcional) datos de prueba
php artisan migrate
php artisan db:seed   # solo local: crea usuarios y datos de ejemplo

# Frontend
npm install
npm run dev

# Servidor (en otra terminal)
php artisan serve
```

O todo junto:

```bash
composer run dev
```

### Datos de prueba (solo `local` / `testing`)

El seeder carga góndolas y productos de ejemplo **solo** si `APP_ENV=local` o `testing`. En producción no se cargan automáticamente.

---

## Despliegue en producción

### 1. Variables de entorno

Creá el archivo `.env` en el servidor con este contenido (ajustá los valores marcados):

```env
# ─── Aplicación ───────────────────────────────────────────────
APP_NAME="Mapa Tienda"
APP_ENV=production
APP_KEY=                          # generar con: php artisan key:generate
APP_DEBUG=false
APP_URL=https://tu-dominio.com    # URL pública con HTTPS

APP_LOCALE=es
APP_FALLBACK_LOCALE=es
APP_FAKER_LOCALE=es_ES

APP_MAINTENANCE_DRIVER=file

# ─── Logs ─────────────────────────────────────────────────────
LOG_CHANNEL=stack
LOG_STACK=single
LOG_DEPRECATIONS_CHANNEL=null
LOG_LEVEL=warning                 # error en tráfico muy alto

# ─── Base de datos (MySQL) ────────────────────────────────────
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=mapa_tienda
DB_USERNAME=mapa_user
DB_PASSWORD=TU_PASSWORD_SEGURO

# Alternativa PostgreSQL:
# DB_CONNECTION=pgsql
# DB_HOST=127.0.0.1
# DB_PORT=5432
# DB_DATABASE=mapa_tienda
# DB_USERNAME=mapa_user
# DB_PASSWORD=TU_PASSWORD_SEGURO

# ─── Sesión ───────────────────────────────────────────────────
SESSION_DRIVER=database
SESSION_LIFETIME=120
SESSION_ENCRYPT=false
SESSION_PATH=/
SESSION_DOMAIN=null               # o .tu-dominio.com si usás subdominios
SESSION_SECURE_COOKIE=true        # obligatorio con HTTPS

# ─── Cache, cola y archivos ───────────────────────────────────
BROADCAST_CONNECTION=log
FILESYSTEM_DISK=local
QUEUE_CONNECTION=database
CACHE_STORE=database

# ─── Correo (para reset de contraseña) ──────────────────────
MAIL_MAILER=smtp
MAIL_HOST=smtp.tu-proveedor.com
MAIL_PORT=587
MAIL_USERNAME=null
MAIL_PASSWORD=null
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS="noreply@tu-dominio.com"
MAIL_FROM_NAME="${APP_NAME}"

# ─── Vite / frontend ──────────────────────────────────────────
VITE_APP_NAME="${APP_NAME}"
```

> **Importante:** nunca subas el `.env` al repositorio. Está en `.gitignore`.

### 2. Comandos de deploy

```bash
# Dependencias
composer install --no-dev --optimize-autoloader
npm ci
npm run build

# Aplicación
php artisan key:generate          # solo la primera vez
php artisan migrate --force       # crea/actualiza tablas (--force permite prod)
php artisan storage:link          # si usás archivos públicos
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

### 3. Crear el usuario administrador

**No ejecutes `php artisan db:seed` en producción.** Creá el admin manualmente:

```bash
php artisan tinker
```

```php
\App\Models\User::create([
    'name' => 'Admin',
    'email' => 'admin@tu-dominio.com',
    'password' => bcrypt('contraseña-muy-segura'),
    'email_verified_at' => now(),
]);
```

### 4. Worker de colas (recomendado)

Con `QUEUE_CONNECTION=database`, configurá un proceso supervisor (systemd, Supervisor, Forge, etc.):

```bash
php artisan queue:work --sleep=3 --tries=3 --max-time=3600
```

### 5. Permisos de carpetas

```bash
chmod -R 775 storage bootstrap/cache
chown -R www-data:www-data storage bootstrap/cache
```

(Ajustá `www-data` según el usuario de tu servidor web.)

### 6. Health check

Laravel expone `/up` para verificar que la app responde.

---

## Checklist post-deploy

- [ ] `APP_DEBUG=false` y `APP_ENV=production`
- [ ] HTTPS activo y `APP_URL` correcta
- [ ] Migraciones aplicadas (`migrate --force`)
- [ ] Admin creado con `tinker` (sin `db:seed`)
- [ ] Mapa de góndolas cargado en `/admin/gondolas`
- [ ] Productos cargados en `/admin/productos`
- [ ] QR generado e impreso desde `/admin/qr`
- [ ] Probar `/buscar` desde un celular
- [ ] Backups automáticos de la base de datos

---

## Estructura de la base de datos

```
users
gondolas          (nombre, color, posicion_x/y, ancho, alto)
productos         (nombre)
gondola_producto  (relación N:M producto ↔ góndola)
```

Un producto puede estar en varias góndolas. Pensado para catálogos de ~500 a 15.000 referencias (almacén de barrio / super chico-mediano).

---

## Comandos útiles

```bash
# Tests
php artisan test

# Lint PHP
composer run lint:check

# Lint + types frontend
npm run lint:check
npm run types:check

# Limpiar cachés (tras cambiar .env)
php artisan config:clear
php artisan route:clear
php artisan view:clear
```

---

## Seguridad

- No hay registro público: solo usuarios creados manualmente pueden acceder al panel.
- Las rutas `/admin/*` requieren autenticación.
- Activá 2FA desde **Ajustes → Seguridad** tras el primer login.
- Los seeders son solo para desarrollo; no los uses en producción.

---

## Licencia

MIT