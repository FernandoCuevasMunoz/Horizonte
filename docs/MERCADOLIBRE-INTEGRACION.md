# Integración MercadoLibre API — Horizonte Inmobiliario

> Guía completa para publicar propiedades de Horizonte Inmobiliario en MercadoLibre y Portal Inmobiliario (Chile).

---

## Índice

1. [¿Qué es esto?](#1-qué-es-esto)
2. [Arquitectura](#2-arquitectura)
3. [Requisitos previos](#3-requisitos-previos)
4. [Paso 1: Crear cuenta en MercadoLibre](#4-paso-1-crear-cuenta-en-mercadolibre)
5. [Paso 2: Crear aplicación (obtener credenciales)](#5-paso-2-crear-aplicación-obtener-credenciales)
6. [Paso 3: Autenticación OAuth2](#6-paso-3-autenticación-oauth2)
7. [Paso 4: Descubrir categorías para Chile](#7-paso-4-descubrir-categorías-para-chile)
8. [Paso 5: Publicar una propiedad](#8-paso-5-publicar-una-propiedad)
9. [Paso 6: Actualizar una publicación](#9-paso-6-actualizar-una-publicación)
10. [Paso 7: Despublicar](#10-paso-7-despublicar)
11. [Manejo de tokens (refresh)](#11-manejo-de-tokens-refresh)
12. [Mapeo de campos](#12-mapeo-de-campos)
13. [Imágenes](#13-imágenes)
14. [Errores comunes](#14-errores-comunes)
15. [Endpoints de la API](#15-endpoints-de-la-api)
16. [Variables de entorno](#16-variables-de-entorno)
17. [Diagrama de conexión](#17-diagrama-de-conexión)

---

## 1. ¿Qué es esto?

Esta integración permite publicar automáticamente las propiedades de **Horizonte Inmobiliario** en:
- **MercadoLibre** (mercadolibre.cl)
- **Portal Inmobiliario** (portalimobiliario.cl)

Ambos portales están conectados. Al publicar en MercadoLibre con el atributo `CMG_SITE: "POI"`, la propiedad aparece en ambos sitios.

---

## 2. Arquitectura

```
┌──────────────┐    ┌──────────────┐    ┌──────────────────────────────┐
│   FRONTEND   │    │   BACKEND    │    │     MERCADOLIBRE API         │
│   (React)    │    │ (Spring Boot)│    │     (api.mercadolibre.com)   │
└──────┬───────┘    └──────┬───────┘    └──────────────┬───────────────┘
       │                   │                           │
       │  Click            │                           │
       │  "Conectar ML"    │                           │
       │──────────────────>│                           │
       │                   │  Genera URL de auth       │
       │  Redirige a       │                           │
       │  auth.mercadolibre│                           │
       │<──────────────────│                           │
       │                   │                           │
       │  User login +     │                           │
       │  acepta permisos  │                           │
       │─────────────────────────────────────────────>│
       │                   │                           │
       │  Redirect a       │                           │
       │  /api/ml/callback │                           │
       │──────────────────>│                           │
       │                   │  POST /oauth/token        │
       │                   │  (code → access_token)    │
       │                   │─────────────────────────>│
       │                   │                           │
       │                   │  access_token +           │
       │                   │  refresh_token            │
       │                   │<─────────────────────────│
       │                   │                           │
       │                   │  Guarda tokens en BD      │
       │  "Conectado ✓"    │                           │
       │<──────────────────│                           │
       │                   │                           │
       │  Click            │                           │
       │  "Publicar en ML" │                           │
       │──────────────────>│                           │
       │                   │  POST /items              │
       │                   │  (JSON con propiedad)     │
       │                   │─────────────────────────>│
       │                   │                           │
       │                   │  ml_item_id + permalink   │
       │                   │<─────────────────────────│
       │                   │                           │
       │                   │  Guarda en BD             │
       │  "Publicado ✓"    │                           │
       │<──────────────────│                           │
```

---

## 3. Requisitos previos

### 3.1 Cuenta de MercadoLibre
- Crear cuenta en [mercadolibre.cl](https://www.mercadolibre.cl)
- La cuenta debe ser de **administrador** (no colaborador/operador)

### 3.2 Aplicación en MercadoLibre
- Crear app en [developers.mercadolibre.cl](https://developers.mercadolibre.cl)
- Obtener: `APP_ID` (Client ID) y `SECRET_KEY` (Client Secret)
- Configurar `redirect_uri` (URL exacta donde ML redirige después del login)

### 3.3 Variables de entorno
Las siguientes variables deben estar configuradas en **Render**:

| Variable | Ejemplo | Descripción |
|----------|---------|-------------|
| `ML_APP_ID` | `5279813714536977` | Client ID de tu app |
| `ML_SECRET_KEY` | `WyXFkMHgllJ32yqd6G8h6TppDiqcGJm4` | Client Secret de tu app |
| `ML_REDIRECT_URI` | `https://horizonte-6xew.onrender.com/api/ml/callback` | URL de callback |
| `ML_SITE_ID` | `MLC` | Código del sitio (Chile) |
| `ML_CONTACT_NAME` | `Horizonte Inmobiliario` | Nombre del contacto |
| `ML_CONTACT_PHONE` | `912345678` | Teléfono del contacto |
| `ML_CONTACT_EMAIL` | `horizonteinmobiliariocl@gmail.com` | Email del contacto |

---

## 4. Paso 1: Crear cuenta en MercadoLibre

1. Ve a [mercadolibre.cl](https://www.mercadolibre.cl)
2. Haz clic en "Crear cuenta"
3. Completa tus datos
4. **Importante:** Usa la cuenta que será el **vendedor** de las propiedades

---

## 5. Paso 2: Crear aplicación (obtener credenciales)

1. Ve a [developers.mercadolibre.cl](https://developers.mercadolibre.cl)
2. Inicia sesión con tu cuenta de MercadoLibre
3. Haz clic en "Crear aplicación"
4. Completa:
   - **Nombre:** "Horizonte Inmobiliario"
   - **Redirect URI:** `https://horizonte-6xew.onrender.com/api/ml/callback`
   - **Callback URL (notificaciones):** `https://horizonte-6xew.onrender.com/api/ml/notifications`
5. Selecciona **Negocios:** Mercado Libre
6. Selecciona **Permisos:**
   - Usuarios → Lectura y escritura
   - Publicación y sincronización → Lectura y escritura
7. Selecciona **Tópicos:**
   - items → items, questions
   - messages → Created, Read
8. Guarda:
   - **APP_ID** (Client ID)
   - **SECRET_KEY** (Client Secret)

---

## 6. Paso 3: Autenticación OAuth2

### 6.1 ¿Qué es OAuth2?
Es un protocolo que permite a tu aplicación acceder a datos privados del usuario (sus publicaciones) sin revelar su contraseña.

### 6.2 Flujo completo

```
Paso 1: Tu app redirige al usuario a MercadoLibre
    ↓
Paso 2: El usuario se loguea y acepta permisos
    ↓
Paso 3: MercadoLibre redirige a tu callback con un código
    ↓
Paso 4: Tu backend intercambia el código por un access_token
    ↓
Paso 5: Usas el access_token para hacer llamadas a la API
```

### 6.3 URL de autorización

Para Chile, la URL es:

```
https://auth.mercadolibre.cl/authorization?response_type=code&client_id=TU_APP_ID&redirect_uri=TU_REDIRECT_URI
```

**Parámetros:**
- `response_type=code` → Siempre "code"
- `client_id` → Tu APP_ID
- `redirect_uri` → Debe ser **exactamente** la que configuraste en la app

### 6.4 Respuesta del callback

Después del login, MercadoLibre redirige a:

```
TU_REDIRECT_URI?code=CODIGO_DE_AUTORIZACION
```

Guarda ese `code`. Lo necesitas para el siguiente paso.

### 6.5 Intercambiar código por token

```bash
curl -X POST \
  -H 'Content-Type: application/x-www-form-urlencoded' \
  -d 'grant_type=authorization_code' \
  -d 'client_id=TU_APP_ID' \
  -d 'client_secret=TU_SECRET_KEY' \
  -d 'code=CODIGO_DE_AUTORIZACION' \
  -d 'redirect_uri=TU_REDIRECT_URI' \
  https://api.mercadolibre.com/oauth/token
```

**Respuesta:**

```json
{
  "access_token": "APP_USR-123456-090515-abc123-1234567",
  "token_type": "bearer",
  "expires_in": 10800,
  "scope": "offline_access read write",
  "user_id": 1234567,
  "refresh_token": "TG-5b9032b4e23464aed1f959f-1234567"
}
```

**Guarda:**
- `access_token` → Lo usas para cada llamada a la API
- `refresh_token` → Lo usas para renovar el token cuando expire
- `expires_in` → Tiempo de vida en segundos (10800 = 3 horas)

### 6.6 Verificar que funciona

```bash
curl -H 'Authorization: Bearer TU_ACCESS_TOKEN' \
  https://api.mercadolibre.com/users/me
```

Si respondes con los datos de tu usuario, todo está funcionando.

---

## 7. Paso 4: Descubrir categorías para Chile

### 7.1 Obtener categorías del sitio

```bash
curl -H 'Authorization: Bearer TU_ACCESS_TOKEN' \
  https://api.mercadolibre.com/sites/MLC/categories
```

Busca la categoría "Inmuebles". El ID será algo como `MLC1459`.

### 7.2 Obtener tipos de propiedad

```bash
curl -H 'Authorization: Bearer TU_ACCESS_TOKEN' \
  https://api.mercadolibre.com/categories/MLC1459
```

En `children_categories` encontrarás:
- `MLC1466` → Casas
- `MLC1472` → Departamentos
- `MLC50538` → Oficinas
- `MLC79242` → Locales
- etc.

### 7.3 Obtener operaciones (Venta/Arriendo)

```bash
curl -H 'Authorization: Bearer TU_ACCESS_TOKEN' \
  https://api.mercadolibre.com/categories/MLC1466
```

En `children_categories`:
- `MLC1467` → Arriendo
- `MLC1468` → Venta

### 7.4 Obtener subtipo (Individual/Proyectos)

```bash
curl -H 'Authorization: Bearer TU_ACCESS_TOKEN' \
  https://api.mercadolibre.com/categories/MLC1468
```

En `children_categories`:
- `MLC401685` → Propiedades Individuales
- `MLC401805` → Emprendimientos

### 7.5 La categoría final

El ID del último nivel es el que usas en `category_id`. Por ejemplo:

```
MLC1459 (Inmuebles) → MLC1466 (Casas) → MLC1468 (Venta) → MLC401685 (Individual)
```

La categoría final es **`MLC401685`**.

---

## 8. Paso 5: Publicar una propiedad

### 8.1 Endpoint

```
POST https://api.mercadolibre.com/items
```

### 8.2 Headers

```
Authorization: Bearer TU_ACCESS_TOKEN
Content-Type: application/json
```

### 8.3 Body de ejemplo (Casa en venta)

```json
{
  "title": "Venta Casa 3 dormitorios El Bosque",
  "category_id": "MLC401685",
  "price": 200000000,
  "currency_id": "CLP",
  "available_quantity": 1,
  "buying_mode": "classified",
  "listing_type_id": "silver",
  "condition": "used",
  "channels": ["marketplace"],
  "pictures": [
    { "source": "https://res.cloudinary.com/k1liapob/image/upload/..." },
    { "source": "https://res.cloudinary.com/k1liapob/image/upload/..." }
  ],
  "seller_contact": {
    "contact": "Horizonte Inmobiliario",
    "area_code": "9",
    "phone": "12345678",
    "email": "horizonteinmobiliariocl@gmail.com"
  },
  "location": {
    "address_line": "Av. Padre Hurtado 12489, El Bosque",
    "latitude": -33.573548,
    "longitude": -70.674445
  },
  "attributes": [
    { "id": "BEDROOMS", "value_name": "3" },
    { "id": "FULL_BATHROOMS", "value_name": "1" },
    { "id": "PARKING_LOTS", "value_name": "0" },
    { "id": "COVERED_AREA", "value_name": "130 m²" },
    { "id": "TOTAL_AREA", "value_name": "212 m²" },
    { "id": "ROOMS", "value_name": "5" },
    { "id": "MAINTENANCE_FEE", "value_name": "0" },
    { "id": "IS_SUITABLE_FOR_PETS", "value_name": "No" },
    { "id": "FURNISHED", "value_name": "No" },
    { "id": "WAREHOUSES", "value_name": "1" },
    { "id": "PROPERTY_TYPE", "value_id": "242076", "value_name": "Casa" },
    { "id": "OPERATION", "value_id": "242075", "value_name": "Venta" },
    { "id": "OPERATION_SUBTYPE", "value_id": "244562", "value_name": "Propiedad individual" },
    { "id": "CMG_SITE", "value_name": "POI" }
  ],
  "description": {
    "plain_text": "Propiedad en sector habitacional consolidado de El Bosque..."
  }
}
```

### 8.4 Respuesta exitosa

```json
{
  "id": "MLC1234567890",
  "site_id": "MLC",
  "title": "Venta Casa 3 dormitorios El Bosque",
  "status": "active",
  "permalink": "https://inmuebles.mercadolibre.cl/MLC-1234567890-venta-casa-_JM",
  "pictures": [...],
  "attributes": [...]
}
```

**Guarda:**
- `id` → Identificador de la publicación en ML (ej: `MLC1234567890`)
- `permalink` → URL pública de la publicación

---

## 9. Paso 6: Actualizar una publicación

```bash
curl -X PUT \
  -H 'Authorization: Bearer TU_ACCESS_TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{"price": 180000000}' \
  https://api.mercadolibre.com/items/MLC1234567890
```

Solo envía los campos que quieras actualizar.

---

## 10. Paso 7: Despublicar

```bash
curl -X PUT \
  -H 'Authorization: Bearer TU_ACCESS_TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{"status": "closed"}' \
  https://api.mercadolibre.com/items/MLC1234567890
```

---

## 11. Manejo de tokens (refresh)

### 11.1 ¿Cuándo refrescar?
El `access_token` expira en **3 horas** (10800 segundos). Antes de hacer cualquier llamada, verifica si expiró.

### 11.2 ¿Cómo refrescar?

```bash
curl -X POST \
  -H 'Content-Type: application/x-www-form-urlencoded' \
  -d 'grant_type=refresh_token' \
  -d 'client_id=TU_APP_ID' \
  -d 'client_secret=TU_SECRET_KEY' \
  -d 'refresh_token=TU_REFRESH_TOKEN' \
  https://api.mercadolibre.com/oauth/token
```

### 11.3 Reglas importantes

| Regla | Detalle |
|-------|---------|
| **Un solo uso** | Cada `refresh_token` solo se puede usar una vez |
| **Nuevo token cada vez** | Al refrescar, recibes un nuevo `refresh_token` |
| **Guardar el nuevo** | Siempre guarda el nuevo `refresh_token` en BD |
| **Expiración** | El `refresh_token` expira a los **6 meses** sin uso |
| **Último válido** | Solo el último `refresh_token` generado es válido |

### 11.4 ¿Qué invalida los tokens?

- Cambio de contraseña del usuario
- Actualización del `client_secret`
- Revocación de permisos
- Inactividad por 4 meses

---

## 12. Mapeo de campos

### 12.1 Campos obligatorios

| Campo ML | Tipo | Valores | Descripción |
|----------|------|---------|-------------|
| `title` | string | Texto | Formato: "Operación Tipo Propiedad Ambientes Barrio" |
| `category_id` | string | ID | Categoría final (ej: `MLC401685`) |
| `price` | integer | Numérico | Precio en CLP |
| `currency_id` | string | `"CLP"` | Moneda |
| `available_quantity` | integer | `1` | Siempre 1 para inmuebles |
| `buying_mode` | string | `"classified"` | Siempre "classified" |
| `listing_type_id` | string | `"silver"` | Plan de publicación |
| `condition` | string | `"used"` / `"new"` / `"not_specified"` | Estado |
| `channels` | array | `["marketplace"]` | Canal de venta |
| `pictures` | array | URLs | **Obligatorio:** al menos 1 imagen |

### 12.2 Atributos obligatorios

| ID | Nombre | Tipo | Ejemplo |
|----|--------|------|---------|
| `BEDROOMS` | Dormitorios | number | `"3"` |
| `FULL_BATHROOMS` | Baños completos | number | `"1"` |
| `PARKING_LOTS` | Estacionamientos | number | `"0"` |
| `COVERED_AREA` | Superficie construida | number_unit | `"130 m²"` |
| `TOTAL_AREA` | Superficie terreno | number_unit | `"212 m²"` |
| `ROOMS` | Ambientes | number | `"5"` |
| `MAINTENANCE_FEE` | Gastos comunes | number | `"80000"` |
| `IS_SUITABLE_FOR_PETS` | Acepta mascotas | string | `"Sí"` / `"No"` |
| `FURNISHED` | Amoblado | string | `"Sí"` / `"No"` |
| `WAREHOUSES` | Bodegas | number | `"1"` |
| `PROPERTY_TYPE` | Tipo propiedad | string_id | `"Casa"` |
| `OPERATION` | Operación | string_id | `"Venta"` |
| `OPERATION_SUBTYPE` | Subtipo | string_id | `"Propiedad individual"` |
| `CMG_SITE` | Portal Inmobiliario | string | `"POI"` |

### 12.3 Mapeo: Horizonte → MercadoLibre

| Campo Horizonte | Campo ML |
|-----------------|----------|
| `title` | `title` |
| `numericPrice` | `price` |
| `type` | `attributes.PROPERTY_TYPE` |
| `operation` | `attributes.OPERATION` |
| `beds` | `attributes.BEDROOMS` |
| `baths` | `attributes.FULL_BATHROOMS` |
| `parking` | `attributes.PARKING_LOTS` |
| `area` | `attributes.COVERED_AREA` |
| `landArea` | `attributes.TOTAL_AREA` |
| `expenses` | `attributes.MAINTENANCE_FEE` |
| `rooms` | `attributes.ROOMS` |
| `petsAllowed` | `attributes.IS_SUITABLE_FOR_PETS` |
| `furnished` | `attributes.FURNISHED` |
| `warehouses` | `attributes.WAREHOUSES` |
| `location` + `neighborhood` | `location.address_line` |
| `lat`, `lng` | `location.latitude`, `location.longitude` |
| `gallery` | `pictures[].source` |
| `description` | `description.plain_text` |

---

## 13. Imágenes

### 13.1 Requisitos
- **Obligatorio:** al menos 1 imagen desde febrero 2026
- **Formato:** URLs públicas accesibles
- **Máximo:** 30 imágenes por publicación

### 13.2 Cantidad mínima recomendada

| Tipo de propiedad | Mínimo fotos |
|-------------------|--------------|
| Casas, Deptos, Oficinas, Parcelas | 12 |
| Locales, Terrenos, Bodegas | 6 |
| Estacionamientos | 4 |

### 13.3 Formato en el JSON

```json
"pictures": [
  { "source": "https://res.cloudinary.com/k1liapob/image/upload/..." },
  { "source": "https://res.cloudinary.com/k1liapob/image/upload/..." }
]
```

### 13.4 Imágenes de Cloudinary
Las imágenes de Horizonte ya están en Cloudinary. Se pueden usar directamente como `source`.

---

## 14. Errores comunes

| Error | Código | Causa | Solución |
|-------|--------|-------|----------|
| `invalid_client` | 401 | APP_ID o SECRET_KEY incorrectos | Verificar credenciales |
| `invalid_grant` | 400 | Code o refresh_token expirado/ya usado | Obtener nuevo code/refresh |
| `unauthorized_client` | 403 | App no autorizada para el usuario | Verificar que el usuario sea admin |
| `LTP_PICTURE_REQUIRED` | 400 | Falta imagen | Incluir al menos 1 en `pictures` |
| `429` | 429 | Demasiadas llamadas | Esperar y reintentar (backoff) |
| `invalid_operator_user_id` | 400 | Usuario es colaborador | Usar cuenta de administrador |

---

## 15. Endpoints de la API

### Autenticación
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `GET` | `/sites/MLC/categories` | Obtener categorías |
| `GET` | `/categories/{ID}` | Detalle de categoría |
| `GET` | `/categories/{ID}/attributes` | Atributos requeridos |
| `POST` | `/oauth/token` | Obtener/renovar token |

### Publicación
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `POST` | `/items` | Crear publicación |
| `PUT` | `/items/{ID}` | Actualizar publicación |
| `GET` | `/items/{ID}` | Obtener detalle |
| `POST` | `/items/{ID}/description` | Agregar descripción |
| `GET` | `/users/me` | Datos del usuario |

### Localización
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `GET` | `/classified_locations/countries` | Lista de países |
| `GET` | `/classified_locations/countries/{ID}` | Detalle país + estados |
| `GET` | `/classified_locations/states/{ID}` | Detalle estado + ciudades |
| `GET` | `/classified_locations/cities/{ID}` | Detalle ciudad + barrios |
| `GET` | `/classified_locations/neighborhoods/{ID}` | Detalle barrio |

---

## 16. Variables de entorno

### En Render (Backend)

```bash
ML_APP_ID=5279813714536977
ML_SECRET_KEY=WyXFkMHgllJ32yqd6G8h6TppDiqcGJm4
ML_REDIRECT_URI=https://horizonte-6xew.onrender.com/api/ml/callback
ML_SITE_ID=MLC
ML_CONTACT_NAME=Horizonte Inmobiliario
ML_CONTACT_PHONE=912345678
ML_CONTACT_EMAIL=horizonteinmobiliariocl@gmail.com
```

---

## 17. Diagrama de conexión

### Flujo completo

```
1. CONEXIÓN (una vez)
   ├── Admin hace clic "Conectar ML"
   ├── Backend genera URL de autorización
   ├── Usuario loguea en MercadoLibre
   ├── MercadoLibre redirige con ?code=XXX
   ├── Backend intercambia code por tokens
   └── Tokens guardados en BD

2. PUBLICACIÓN (por propiedad)
   ├── Admin hace clic "Publicar en ML"
   ├── Backend verifica token (refresca si expiró)
   ├── Backend construye JSON con datos de la propiedad
   ├── Backend envía POST /items
   ├── MercadoLibre responde con ml_item_id + permalink
   └── Backend guarda ml_item_id en BD

3. REFRESH (automático cada 3h)
   ├── Antes de cada llamada, verificar expiración
   ├── Si expiró: POST /oauth/token con refresh_token
   ├── Guardar nuevo access_token + refresh_token
   └── Continuar con la operación

4. DESPUBLICACIÓN (por propiedad)
   ├── Admin hace clic "Despublicar"
   ├── Backend envía PUT /items/{ml_id} con status: closed
   └── Publicación desactivada en MercadoLibre
```

### Base de datos

```
TABLE: ml_tokens
┌────┬──────────────┬──────────────┬───────────┬─────────┐
│ id │ access_token │ refresh_token│ expires_at│ user_id │
└────┴──────────────┴──────────────┴───────────┴─────────┘

TABLE: ml_publications
┌────┬─────────────┬─────────────┬──────────┬───────────┐
│ id │ property_id │ ml_item_id  │ status   │ permalink │
└────┴─────────────┴─────────────┴──────────┴───────────┘

TABLE: properties (campos nuevos)
┌─────┬───────┬─────────┬───────────┐
│rooms│pets   │furnished│warehouses │
└─────┴───────┴─────────┴───────────┘
```

---

## Referencias

- [Portal de desarrolladores](https://developers.mercadolibre.cl)
- [Guía de inmuebles](https://developers.mercadolibre.cl/es_ar/introduccion-guia-de-inmuebles)
- [Publicar inmuebles](https://developers.mercadolibre.cl/es_ar/publica-inmueble)
- [Categorías](https://developers.mercadolibre.cl/es_ar/categorias-inmuebles)
- [Atributos](https://developers.mercadolibre.cl/es_ar/atributos-inmuebles)
- [Autenticación](https://developers.mercadolibre.cl/es_ar/autenticacion-y-autorizacion)
- [Localización](https://developers.mercadolibre.cl/es_ar/localizar-inmuebles)
- [Rate Limit](https://developers.mercadolibre.cl/es_ar/rate-limit-error-429)

---

*Documento generado para Horizonte Inmobiliario — Julio 2026*
