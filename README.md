# SGE Logistics - Sistema de Gestión de Encomiendas y Envíos

Sistema web para la gestión integral de encomiendas, envíos, seguimiento, pagos y facturación. Expone una **API REST** desarrollada con NestJS, frontend en Angular y base de datos PostgreSQL.

---

## Tecnologías Utilizadas

### Backend (`partelogica/`)
- **Runtime:** Node.js 24.14.1 (Alpine)
- **Framework:** NestJS 11.1.21
- **ORM:** TypeORM
- **Autenticación:** JWT + Passport + bcrypt
- **Validación:** class-validator + class-transformer
- **Documentación API:** Swagger (OpenAPI)
- **Base de Datos:** PostgreSQL 17 (driver pg)

### Frontend (`partevisual/`)
- **Framework:** Angular 21 (standalone components, Signals)
- **Estilos:** Tailwind CSS
- **Estado reactivo:** Signals
- **Control flow:** @if/@for (moderno, sin *ngIf/*ngFor)
- **Autenticación:** JWT (localStorage + interceptor HTTP funcional)
- **Build:** Vite (Angular CLI)

### Infraestructura
- **Contenedores:** Docker + Docker Compose
- **Base de Datos:** PostgreSQL 17 Alpine
- **Orquestación:** 3 servicios (db, backend, frontend)
- **Determinismo:** npm ci en builds Docker

---

## Descripción del Sistema

SGE Logistics permite gestionar:

- **Clientes** — CRUD completo con contactos asociados y sucursales
- **Sucursales** — Puntos de origen y destino de envíos
- **Empleados** — Personal del sistema vinculado a usuarios
- **Usuarios** — Credenciales de acceso con roles (admin/operador)
- **Encomiendas** — Paquetes registrados con remitente, destinatario, detalles y seguro opcional
- **Envíos** — Asignación de encomiendas a rutas con costos y estados
- **Seguimiento** — Historial de hitos por envío con actualización de estado
- **Finanzas** — Pagos, métodos de pago (Efectivo/QR/Tarjeta) y facturación

---

## Requisitos

- **Docker** + **Docker Compose** instalados
- Puertos **3000**, **4200** y **5432** libres

---

## Cómo Ejecutar (Descargado de GitHub)

```bash
# 1. Clonar el repositorio
git clone https://github.com/BaltasarJunior520/proyectofinal.git
cd proyectofinal

# 2. Iniciar todos los servicios
docker-compose up -d

# 3. Acceder al sistema
Frontend: http://localhost:4200
Backend API: http://localhost:3000
Swagger Docs: http://localhost:3000/api/docs
```

## Credenciales de Prueba

| Usuario | Contraseña | Rol |
|---------|-----------|-----|
| `admin` | `123` | Administrador |
| `operador1` | `123` | Operador |

## Comandos Útiles

```bash
# Ver logs en tiempo real
docker-compose logs -f

# Reconstruir y reiniciar un servicio específico
docker-compose up -d --build backend

# Detener y eliminar todo (incluyendo datos)
docker-compose down -v

# Acceder a la base de datos
docker exec -it sge-postgres psql -U postgres -d sgebd
```

---

## Estructura del Proyecto

```
proyectofinal/
├── basededatos/          # Scripts SQL (tablas + datos iniciales)
├── partelogica/          # Backend NestJS
│   └── src/
│       ├── auth/         # Autenticación JWT
│       ├── usuarios/     # Gestión de usuarios
│       ├── empleados/    # Gestión de empleados
│       ├── clientes/     # CRUD de clientes
│       ├── sucursales/   # CRUD de sucursales
│       ├── encomiendas/  # Gestión de encomiendas
│       ├── envios/       # Gestión de envíos y entregas
│       ├── seguimientos/ # Historial de seguimiento
│       └── finanzas/     # Pagos y facturación
├── partevisual/          # Frontend Angular
│   └── src/app/
│       ├── login/        # Pantalla de inicio de sesión
│       ├── dashboard/    # Panel principal
│       ├── clientes/     # Gestión de clientes
│       ├── encomiendas/  # Gestión de encomiendas
│       ├── envios/       # Gestión de envíos
│       ├── finanzas/     # Caja y facturación
│       ├── layout/       # Sidebar + Topbar
│       ├── services/     # Servicios HTTP
│       └── components/   # Componentes compartidos
└── docker-compose.yml    # Orquestación de servicios
```
