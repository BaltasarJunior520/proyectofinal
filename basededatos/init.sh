#!/bin/bash

set -e

# Obtener directorio del script o usar /basededatos si es Docker
DIR="$(cd "$(dirname "${BASH_SOURCE[0]:-$0}")" && pwd)"
if [ -d "/basededatos" ]; then
  SQL_DIR="/basededatos"
else
  SQL_DIR="$DIR"
fi

export PGPASSWORD=123qwe
DB_HOST=${DB_HOST:-""}

# Si DB_HOST está seteado, agregar el flag -h
HOST_FLAG=""
if [ -n "$DB_HOST" ]; then
  HOST_FLAG="-h $DB_HOST"
fi

# Crear DB si no existe
psql $HOST_FLAG -U postgres -tc "SELECT 1 FROM pg_database WHERE datname='sgebd'" | grep -q 1 \
  || psql $HOST_FLAG -U postgres -c "CREATE DATABASE sgebd;"

echo "Base de datos lista"

# 🔥 BORRAR TODO el esquema público (más seguro)
psql $HOST_FLAG -U postgres -d sgebd -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"

# Crear tablas
psql $HOST_FLAG -U postgres -d sgebd -f "$SQL_DIR/tablas.sql"

# Insertar datos
psql $HOST_FLAG -U postgres -d sgebd -f "$SQL_DIR/datos.sql"

echo "Base de datos inicializada correctamente"