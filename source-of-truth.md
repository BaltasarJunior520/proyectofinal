## 4. PLAN DE EJECUCIÓN ATÓMICO (SDD)

**Directiva Estricta para el Agente:** Debes ejecutar este proyecto de forma secuencial. No puedes avanzar a una nueva fase sin haber completado y validado la anterior.
- **Ignorar ruido del modelo:** Las referencias en el modelo de datos a múltiples bases de datos (ej. `sisencbd1`) y grupos de usuarios (ej. `grupol`) deben ser ignoradas por completo. La única fuente de verdad para la infraestructura de datos es el script `init.sh` existente.
- **Esqueleto existente:** Las carpetas `basededatos/` y `partelogica/` (NestJS inicializado) ya existen. No intentes recrearlas.

### FASE 1: Orquestación e Infraestructura Base
1. Revisar el archivo `init.sh` en la carpeta `basededatos` y corregir cualquier discrepancia tipográfica (asegurar que todo apunte a la base de datos `sgebd`).
2. Crear un archivo `docker-compose.yml` en la raíz del proyecto.
3. Configurar en el `docker-compose.yml` el servicio de PostgreSQL (versión 15 o superior).
4. Mapear un volumen en el `docker-compose.yml` para que el contenedor de base de datos ejecute automáticamente el `init.sh` en su inicialización.
5. Levantar el contenedor y confirmar la creación exitosa del esquema `public` y la inserción de datos semilla.

### FASE 2: Configuración Core del Backend (NestJS)
1. Instalar dependencias estrictamente necesarias en `partelogica/`: `@nestjs/typeorm`, `typeorm`, `pg`, `@nestjs/swagger`, `@nestjs/jwt`, `@nestjs/passport`, `passport-jwt`, `bcrypt`, `class-validator`, `class-transformer`.
2. Configurar `TypeOrmModule.forRootAsync` en `app.module.ts`, leyendo las credenciales mediante variables de entorno coincidentes con el `docker-compose.yml`.
3. Habilitar la validación global en `main.ts` usando `ValidationPipe`.
4. Configurar la documentación de Swagger en `main.ts` con la ruta `/api/docs`.
5. Crear el archivo `Dockerfile` para el entorno de desarrollo del backend y añadir el servicio al `docker-compose.yml`.

### FASE 3: Módulo de Autenticación y Empleados (Backend)
1. Crear el módulo `Usuarios` (Entity, Service, Controller, DTOs).
2. Implementar un *Subscriber* o un *Hook* de TypeORM en la entidad Usuario para que la contraseña siempre se encripte con `bcrypt` antes de un `INSERT` o `UPDATE`.
3. Configurar la relación One-to-One entre la entidad `Usuario` y la entidad `Empleado`.
4. Crear el módulo `Auth`.
5. Implementar el endpoint `POST /auth/login` que valide credenciales y retorne un JWT (incluyendo el `rol` y el `empleado_id` en el payload).
6. Crear un *Guard* global o específico para proteger las rutas REST.

### FASE 4: Módulos de Lógica de Negocio (Backend)
1. Desarrollar el módulo `Clientes` y `Sucursales` con todos sus endpoints CRUD documentados en Swagger.
2. Desarrollar el módulo `Encomiendas`. **Requisito Atómico:** El endpoint de creación debe usar *Database Transactions* (QueryRunner) para insertar la encomienda, el detalle y el seguro en una única operación segura.
3. Desarrollar el módulo `Envios`. El endpoint de creación debe generar un envío a partir del ID de una encomienda válida.
4. Desarrollar el módulo `Seguimiento`. El endpoint de inserción debe recibir la ubicación en formato de texto y el nuevo estado.
5. Desarrollar el módulo `Finanzas` (Pagos y Facturación opcional), asegurando la relación uno a uno entre ambos registros.
6. Implementar pruebas unitarias básicas con Jest para al menos el `EncomiendasService` y el `EnviosService`.

### FASE 5: Configuración Core del Frontend (Angular 21)
1. Ejecutar la inicialización de Angular en la carpeta `partevisual/` (asegurando el uso de Standalone Components).
2. Instalar y configurar TailwindCSS 3 (`tailwind.config.js`, `styles.css`).
3. Crear el archivo `Dockerfile` para el frontend y agregarlo al `docker-compose.yml`.
4. Configurar el Interceptor HTTP (`auth.interceptor.ts`) para adjuntar automáticamente el token JWT en las cabeceras `Authorization` de todas las peticiones salientes.

### FASE 6: Layout Administrativo (Frontend)
1. Crear el componente `SidebarComponent` con la navegación mediante *routerLinks* hacia todos los módulos.
2. Crear el componente `TopbarComponent` que incluya el toggle del menú, botón de fullscreen y botón de cierre de sesión.
3. Crear el `MainLayoutComponent` que integre el Sidebar, el Topbar y un `<router-outlet>` en el centro.
4. Implementar el `LoginComponent` funcional que consuma la API y guarde el JWT en localStorage o cookies.
5. Configurar el sistema de rutas principales protegidas por un *AuthGuard*.

### FASE 7: Desarrollo de Vistas y Signals (Frontend)
1. Crear componentes de UI reutilizables (Tabla con paginación, Input de búsqueda, Modal).
2. Desarrollar la vista de `Clientes` consumiendo los endpoints, usando **Signals** (`signal()`, `computed()`) para manejar la lista de clientes reactivamente.
3. Desarrollar la vista de `Encomiendas`, incluyendo un formulario reactivo maestro-detalle complejo para registrar los ítems de la encomienda y el seguro.
4. Desarrollar la vista de `Gestión de Envíos`, permitiendo el cambio de estados y visualización del historial de seguimiento.
5. Desarrollar la vista de `Caja`, para la administración de los pagos y visualización de la facturación.

Regla estricta: Asegúrate de generar un CRUD completo y 100% funcional (con su vista en Angular y sus endpoints en NestJS) para CADA UNA de las entidades principales definidas en mi tablas.sql (Usuario, Empleado, Cliente, Sucursal, Encomienda, Envío, Seguimiento, Pago y Factura), respetando la agrupación modular del .md.