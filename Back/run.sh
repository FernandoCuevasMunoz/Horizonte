#!/bin/bash
set -a; DIR="$(cd "$(dirname "$0")" && pwd)"; source "$DIR/.env"; set +a
export JAVA_HOME=$(mise where java@openjdk-21.0.2)

PROFILE=""
if [ "${1:-}" = "prod" ]; then
  PROFILE="--spring.profiles.active=prod"
  echo "Perfil: production (Neon DB)"
else
  echo "Perfil: development (H2 local)"
fi

exec "$JAVA_HOME/bin/java" -jar "$DIR/target/horizonte-backend-0.0.1-SNAPSHOT.jar" $PROFILE
