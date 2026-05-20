--CLIENTES Y SUCURSALES
CREATE TABLE cliente ( 
  id SERIAL PRIMARY KEY, 
  nombre VARCHAR(100) NOT NULL, 
  apellido VARCHAR(100) NOT NULL, 
  ci VARCHAR(20) UNIQUE, 
  telefono VARCHAR(20), 
  email VARCHAR(100), 
  direccion TEXT, 
  fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP 
); 
CREATE TABLE sucursal ( 
  id SERIAL PRIMARY KEY, 
  nombre VARCHAR(100) NOT NULL, 
  direccion TEXT NOT NULL, 
  ciudad VARCHAR(100), 
  telefono VARCHAR(20) 
); 
CREATE TABLE contacto_cliente ( 
  id SERIAL PRIMARY KEY, 
  cliente_id INT REFERENCES cliente(id) ON DELETE CASCADE, 
  tipo VARCHAR(50), 
  nombre VARCHAR(100), 
  telefono VARCHAR(20) 
); 
CREATE TABLE cliente_sucursal ( 
  cliente_id INT REFERENCES cliente(id) ON DELETE CASCADE, 
  sucursal_id INT REFERENCES sucursal(id) ON DELETE CASCADE, 
  PRIMARY KEY (cliente_id, sucursal_id) 
);

--ENCOMIENDAS
CREATE TABLE encomienda ( 
id SERIAL PRIMARY KEY, 
codigo VARCHAR(50) UNIQUE NOT NULL, 
remitente_id INT REFERENCES cliente(id), 
destinatario_id INT REFERENCES cliente(id), 
descripcion TEXT, 
peso DECIMAL(10,2), 
volumen DECIMAL(10,2), 
valor_declarado DECIMAL(10,2), 
fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP 
); 
CREATE TABLE tipo_paquete ( 
id SERIAL PRIMARY KEY, 
nombre VARCHAR(50), 
descripcion TEXT 
); 
CREATE TABLE detalle_encomienda ( 
id SERIAL PRIMARY KEY, 
encomienda_id INT REFERENCES encomienda(id) ON DELETE CASCADE, 
tipo_id INT REFERENCES tipo_paquete(id), 
cantidad INT, 
observaciones TEXT 
); 
CREATE TABLE seguro ( 
id SERIAL PRIMARY KEY, 
encomienda_id INT UNIQUE REFERENCES encomienda(id) ON DELETE CASCADE, 
monto DECIMAL(10,2), 
descripcion TEXT 
); 

--OPERACIONES (Envio y Seguimiento)
CREATE TABLE estado_envio ( 
id SERIAL PRIMARY KEY, 
nombre VARCHAR(50) 
); 
CREATE TABLE envio ( 
id SERIAL PRIMARY KEY, 
encomienda_id INT UNIQUE REFERENCES encomienda(id) ON DELETE CASCADE, 
sucursal_origen_id INT REFERENCES sucursal(id), 
sucursal_destino_id INT REFERENCES sucursal(id), 
fecha_envio TIMESTAMP, 
fecha_estimada TIMESTAMP, 
costo DECIMAL(10,2), 
estado_id INT REFERENCES estado_envio(id) 
); 
CREATE TABLE seguimiento ( 
id SERIAL PRIMARY KEY, 
envio_id INT REFERENCES envio(id) ON DELETE CASCADE, 
estado_id INT REFERENCES estado_envio(id), 
ubicacion TEXT, 
fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP, 
observaciones TEXT 
); 
CREATE TABLE entrega ( 
id SERIAL PRIMARY KEY, 
envio_id INT UNIQUE REFERENCES envio(id) ON DELETE CASCADE, 
fecha_entrega TIMESTAMP, 
nombre_recibe VARCHAR(100), 
ci_recibe VARCHAR(20), 
firma TEXT 
);

--ADMINISTRACION
CREATE TABLE usuario ( 
id SERIAL PRIMARY KEY, 
nombre_usuario VARCHAR(50) UNIQUE NOT NULL, 
password TEXT NOT NULL, 
rol VARCHAR(50), 
estado BOOLEAN DEFAULT TRUE 
); 
CREATE TABLE empleado ( 
id SERIAL PRIMARY KEY, 
nombre VARCHAR(100), 
apellido VARCHAR(100), 
cargo VARCHAR(100), 
telefono VARCHAR(20), 
sucursal_id INT REFERENCES sucursal(id) 
); 
CREATE TABLE pago ( 
id SERIAL PRIMARY KEY, 
envio_id INT REFERENCES envio(id) ON DELETE CASCADE, 
monto DECIMAL(10,2), 
metodo VARCHAR(50), 
fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP 
); 
CREATE TABLE factura ( 
  id SERIAL PRIMARY KEY, 
  pago_id INT UNIQUE REFERENCES pago(id) ON DELETE CASCADE, 
  numero_factura VARCHAR(50), 
  nit VARCHAR(20), 
  razon_social VARCHAR(150), 
  fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP 
); 

-- Relación One-to-One entre Usuario y Empleado
ALTER TABLE usuario ADD COLUMN empleado_id INT UNIQUE REFERENCES empleado(id) ON DELETE SET NULL;
