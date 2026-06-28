#!/bin/bash
export JAVA_HOME=$(mise where java@openjdk-21.0.2)
export TELEGRAM_BOT_TOKEN="${TELEGRAM_BOT_TOKEN:-TU_TOKEN_AQUI}"
export TELEGRAM_CHAT_ID="${TELEGRAM_CHAT_ID:-}"
export ADMIN_PASSWORD="${ADMIN_PASSWORD:-admin123}"
export EMAIL_HOST="${EMAIL_HOST:-smtp.gmail.com}"
export EMAIL_PORT="${EMAIL_PORT:-587}"
export EMAIL_USERNAME="${EMAIL_USERNAME:-}"
export EMAIL_PASSWORD="${EMAIL_PASSWORD:-}"
export ADMIN_EMAIL="${ADMIN_EMAIL:-admin@horizonteinmobiliario.cl}"
# Producción: agregar --spring.profiles.active=prod y configurar DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD según corresponda
exec "$JAVA_HOME/bin/java" -jar target/horizonte-backend-0.0.1-SNAPSHOT.jar
