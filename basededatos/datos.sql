-- CLIENTES 
INSERT INTO cliente (nombre, apellido, ci, telefono, email, direccion) VALUES 
('Juan', 'Perez', '123456', '77711111', 'juan@gmail.com', 'La Paz'), 
('Maria', 'Lopez', '654321', '77722222', 'maria@gmail.com', 'Cochabamba'), 
('Carlos', 'Quispe', '987654', '77733333', 'carlos@gmail.com', 'Oruro'); 
-- SUCURSALES 
INSERT INTO sucursal (nombre, direccion, ciudad, telefono) VALUES 
('Sucursal Central', 'Av. Siempre Viva', 'La Paz', '2221111'), 
('Sucursal Norte', 'Zona Norte', 'Cochabamba', '3332222'), 
('Sucursal Sur', 'Zona Sur', 'Santa Cruz', '4443333'); 
-- CONTACTOS 
INSERT INTO contacto_cliente (cliente_id, tipo, nombre, telefono) VALUES 
(1, 'Emergencia', 'Ana Perez', '70000001'), 
(2, 'Familiar', 'Luis Lopez', '70000002'); 
-- RELACIÓN CLIENTE-SUCURSAL 
INSERT INTO cliente_sucursal (cliente_id, sucursal_id) VALUES 
(1,1),(1,2), 
(2,2), 
(3,1),(3,3);
-- TIPOS DE PAQUETE 
INSERT INTO tipo_paquete (nombre, descripcion) VALUES 
('Caja', 'Caja de cartón'), 
('Sobre', 'Documentos'), 
('Paquete', 'Paquete general'); 
-- ENCOMIENDAS 
INSERT INTO encomienda (codigo, remitente_id, destinatario_id, descripcion, peso, volumen, valor_declarado) 
VALUES 
('ENC001', 1, 2, 'Ropa', 5.5, 0.3, 200), 
('ENC002', 2, 3, 'Documentos', 1.0, 0.1, 50), 
('ENC003', 3, 1, 'Electrónicos', 3.0, 0.2, 500); 
-- DETALLE 
INSERT INTO detalle_encomienda (encomienda_id, tipo_id, cantidad, observaciones) VALUES 
(1, 1, 2, 'Cajas medianas'), 
(2, 2, 5, 'Sobres sellados'), 
(3, 3, 1, 'Equipo delicado'); 
-- SEGURO 
INSERT INTO seguro (encomienda_id, monto, descripcion) VALUES 
(1, 20, 'Seguro básico'), 
(3, 50, 'Seguro completo');
-- ESTADOS 
INSERT INTO estado_envio (nombre) VALUES 
('Registrado'), 
('En tránsito'), 
('Entregado'); 
-- ENVÍOS 
INSERT INTO envio (encomienda_id, sucursal_origen_id, sucursal_destino_id, fecha_envio, fecha_estimada, 
costo, estado_id) 
VALUES 
(1, 1, 2, NOW(), NOW() + INTERVAL '2 days', 50, 2), 
(2, 2, 3, NOW(), NOW() + INTERVAL '3 days', 30, 1), 
(3, 1, 3, NOW(), NOW() + INTERVAL '1 day', 70, 3); 
-- SEGUIMIENTO 
INSERT INTO seguimiento (envio_id, estado_id, ubicacion, observaciones) VALUES 
(1, 1, 'La Paz', 'Recepción'), 
(1, 2, 'En camino', 'Transporte terrestre'), 
(3, 3, 'Santa Cruz', 'Entregado correctamente'); 
-- ENTREGA 
INSERT INTO entrega (envio_id, fecha_entrega, nombre_recibe, ci_recibe, firma) VALUES 
(3, NOW(), 'Juan Perez', '123456', 'FirmaDigital');
-- EMPLEADOS 
INSERT INTO empleado (nombre, apellido, cargo, telefono, sucursal_id) VALUES 
('Luis', 'Gomez', 'Cajero', '77788888', 1), 
('Ana', 'Martinez', 'Operador', '77799999', 2); 

-- USUARIOS 
INSERT INTO usuario (nombre_usuario, password, rol, empleado_id) VALUES 
('admin', '$2b$10$mei8gF9zUX84zbAGd3NEPuw3rpliDLW..iXAQf7RiAlLPdo/gWReS', 'admin', 1), -- contraseña encriptada '123'
('operador1', '$2b$10$mei8gF9zUX84zbAGd3NEPuw3rpliDLW..iXAQf7RiAlLPdo/gWReS', 'operador', 2); -- contraseña encriptada '123'
-- PAGOS 
INSERT INTO pago (envio_id, monto, metodo) VALUES 
(1, 50, 'Efectivo'), 
(2, 30, 'QR'), 
(3, 70, 'Tarjeta'); 
-- FACTURAS 
INSERT INTO factura (pago_id, numero_factura, nit, razon_social) VALUES 
(1, 'F001', '1234567', 'Juan Perez'), 
(3, 'F002', '7654321', 'Carlos Quispe');