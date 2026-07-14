package com.horizonteinmobiliario.service;

import com.horizonteinmobiliario.model.MercadoLibrePublication;
import com.horizonteinmobiliario.model.MercadoLibreToken;
import com.horizonteinmobiliario.model.Property;
import com.horizonteinmobiliario.repository.MercadoLibrePublicationRepository;
import com.horizonteinmobiliario.repository.MercadoLibreTokenRepository;
import com.horizonteinmobiliario.repository.PropertyRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.MultiValueMap;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.web.client.RestTemplate;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class MercadoLibreService {

    private static final String ML_AUTH_URL = "https://auth.mercadolibre.cl/authorization";
    private static final String ML_TOKEN_URL = "https://api.mercadolibre.com/oauth/token";
    private static final String ML_API_URL = "https://api.mercadolibre.com";

    @Value("${ml.app-id:}")
    private String appId;

    @Value("${ml.secret-key:}")
    private String secretKey;

    @Value("${ml.redirect-uri:}")
    private String redirectUri;

    @Value("${ml.site-id:MLC}")
    private String siteId;

    @Value("${ml.contact-name:Horizonte Inmobiliario}")
    private String contactName;

    @Value("${ml.contact-phone:}")
    private String contactPhone;

    @Value("${ml.contact-email:horizonteinmobiliariocl@gmail.com}")
    private String contactEmail;

    private final MercadoLibreTokenRepository tokenRepo;
    private final MercadoLibrePublicationRepository pubRepo;
    private final PropertyRepository propertyRepo;
    private final RestTemplate restTemplate;
    private final Map<String, String> cityIdCache = new ConcurrentHashMap<>();

    public MercadoLibreService(MercadoLibreTokenRepository tokenRepo,
                               MercadoLibrePublicationRepository pubRepo,
                               PropertyRepository propertyRepo) {
        this.tokenRepo = tokenRepo;
        this.pubRepo = pubRepo;
        this.propertyRepo = propertyRepo;
        this.restTemplate = new RestTemplate();
    }

    public String getAuthUrl() {
        return ML_AUTH_URL
            + "?response_type=code"
            + "&client_id=" + appId
            + "&redirect_uri=" + redirectUri;
    }

    public Map<String, Object> exchangeCodeForToken(String code) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

        MultiValueMap<String, String> body = new LinkedMultiValueMap<>();
        body.add("grant_type", "authorization_code");
        body.add("client_id", appId);
        body.add("client_secret", secretKey);
        body.add("code", code);
        body.add("redirect_uri", redirectUri);

        HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(body, headers);

        try {
            ResponseEntity<Map> response = restTemplate.postForEntity(ML_TOKEN_URL, request, Map.class);
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                Map<String, Object> tokenData = response.getBody();
                saveToken(tokenData);
                return tokenData;
            }
        } catch (Exception e) {
            return Map.of("error", e.getClass().getSimpleName() + ": " + String.valueOf(e.getMessage()));
        }
        return Map.of("error", "Failed to exchange code");
    }

    public Map<String, Object> publishProperty(Long propertyId) {
        MercadoLibreToken token = getValidToken();
        if (token == null) {
            return Map.of("error", "No hay conexión con MercadoLibre. Conecta primero.");
        }

        Property property = propertyRepo.findById(propertyId).orElse(null);
        if (property == null) {
            return Map.of("error", "Propiedad no encontrada");
        }

        Map<String, Object> itemJson = buildItemJson(property);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(token.getAccessToken());

        HttpEntity<Map<String, Object>> request = new HttpEntity<>(itemJson, headers);

        try {
            ResponseEntity<Map> response = restTemplate.postForEntity(ML_API_URL + "/items", request, Map.class);
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                Map<String, Object> result = response.getBody();
                savePublication(propertyId, result);
                return result;
            }
            Map<String, Object> body = response.getBody();
            if (body != null) {
                String msg = (String) body.getOrDefault("message", body.getOrDefault("error", "Error desconocido"));
                return Map.of("error", "ML: " + msg);
            }
        } catch (org.springframework.web.client.HttpClientErrorException e) {
            String responseBody = e.getResponseBodyAsString();
            try {
                com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
                Map<String, Object> errorBody = mapper.readValue(responseBody, Map.class);
                String msg = (String) errorBody.getOrDefault("message", errorBody.get("error"));

                Object causeObj = errorBody.get("cause");
                if (causeObj instanceof List<?> causeList && !causeList.isEmpty()) {
                    StringBuilder details = new StringBuilder();
                    for (Object c : causeList) {
                        if (c instanceof Map<?, ?> rawCauseMap) {
                            @SuppressWarnings("unchecked")
                            Map<String, Object> causeMap = (Map<String, Object>) rawCauseMap;
                            String causeMsg = String.valueOf(causeMap.getOrDefault("message", causeMap.getOrDefault("code", "")));
                            Object attrs = causeMap.get("attributes");
                            if (attrs instanceof List<?> attrList && !attrList.isEmpty()) {
                                details.append(" • ").append(attrList.get(0)).append(": ").append(causeMsg).append("\n");
                            } else {
                                details.append(" • ").append(causeMsg).append("\n");
                            }
                        }
                    }
                    if (!details.isEmpty()) {
                        msg = msg + "\n" + details.toString().trim();
                    }
                }
                return Map.of("error", "ML: " + msg);
            } catch (Exception parseEx) {
                return Map.of("error", "ML: " + responseBody);
            }
        } catch (Exception e) {
            return Map.of("error", e.getClass().getSimpleName() + ": " + String.valueOf(e.getMessage()));
        }
        return Map.of("error", "Error al publicar en MercadoLibre");
    }

    public Map<String, Object> unpublishProperty(Long propertyId) {
        MercadoLibreToken token = getValidToken();
        if (token == null) {
            return Map.of("error", "No hay conexión con MercadoLibre");
        }

        MercadoLibrePublication pub = pubRepo.findByPropertyId(propertyId);
        if (pub == null) {
            return Map.of("error", "Esta propiedad no está publicada en MercadoLibre");
        }

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(token.getAccessToken());

        Map<String, String> body = Map.of("status", "closed");
        HttpEntity<Map<String, String>> request = new HttpEntity<>(body, headers);

        try {
            restTemplate.put(ML_API_URL + "/items/" + pub.getMlItemId(), request);
            pub.setStatus("closed");
            pubRepo.save(pub);
            return Map.of("ok", true, "message", "Publicación desactivada");
        } catch (Exception e) {
            return Map.of("error", e.getClass().getSimpleName() + ": " + String.valueOf(e.getMessage()));
        }
    }

    public Map<String, Object> getMLStatus() {
        MercadoLibreToken token = tokenRepo.findTopByOrderByExpiresAtDesc();
        if (token == null) {
            return Map.of("connected", false);
        }
        return Map.of(
            "connected", true,
            "expiresAt", token.getExpiresAt().toString(),
            "mlUserId", token.getMlUserId()
        );
    }

    public Map<String, Object> getPropertyStatus(Long propertyId) {
        MercadoLibrePublication pub = pubRepo.findByPropertyId(propertyId);
        if (pub == null) {
            return Map.of("published", false);
        }
        return Map.of(
            "published", true,
            "mlItemId", pub.getMlItemId(),
            "status", pub.getStatus(),
            "permalink", pub.getPermalink()
        );
    }

    private MercadoLibreToken getValidToken() {
        MercadoLibreToken token = tokenRepo.findTopByOrderByExpiresAtDesc();
        if (token == null) return null;

        if (token.getExpiresAt().isBefore(Instant.now().plus(5, ChronoUnit.MINUTES))) {
            token = refreshToken(token);
        }
        return token;
    }

    private MercadoLibreToken refreshToken(MercadoLibreToken currentToken) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

        MultiValueMap<String, String> body = new LinkedMultiValueMap<>();
        body.add("grant_type", "refresh_token");
        body.add("client_id", appId);
        body.add("client_secret", secretKey);
        body.add("refresh_token", currentToken.getRefreshToken());

        HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(body, headers);

        try {
            ResponseEntity<Map> response = restTemplate.postForEntity(ML_TOKEN_URL, request, Map.class);
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                return saveToken(response.getBody());
            }
        } catch (Exception e) {
            // Token refresh failed
        }
        return currentToken;
    }

    private MercadoLibreToken saveToken(Map<String, Object> tokenData) {
        MercadoLibreToken token = tokenRepo.findTopByOrderByExpiresAtDesc();
        if (token == null) {
            token = new MercadoLibreToken();
        }

        token.setAccessToken((String) tokenData.get("access_token"));
        token.setRefreshToken((String) tokenData.get("refresh_token"));

        Integer expiresIn = (Integer) tokenData.get("expires_in");
        token.setExpiresAt(Instant.now().plus(expiresIn, ChronoUnit.SECONDS));

        Object userId = tokenData.get("user_id");
        if (userId instanceof Integer) {
            token.setMlUserId(((Integer) userId).longValue());
        } else if (userId instanceof Long) {
            token.setMlUserId((Long) userId);
        }

        return tokenRepo.save(token);
    }

    private void savePublication(Long propertyId, Map<String, Object> result) {
        MercadoLibrePublication pub = pubRepo.findByPropertyId(propertyId);
        if (pub == null) {
            pub = new MercadoLibrePublication();
            pub.setPropertyId(propertyId);
        }

        pub.setMlItemId((String) result.get("id"));
        pub.setStatus((String) result.get("status"));
        pub.setPermalink((String) result.get("permalink"));
        pub.setPublishedAt(Instant.now());

        pubRepo.save(pub);
    }

    private Map<String, Object> buildItemJson(Property property) {
        Map<String, Object> item = new LinkedHashMap<>();

        item.put("title", property.getTitle());
        item.put("category_id", resolveCategoryId(property.getType(), property.getOperation()));
        item.put("price", property.getNumericPrice() != null ? property.getNumericPrice().longValue() : 0);
        item.put("currency_id", "CLP");
        item.put("available_quantity", 1);
        item.put("buying_mode", "classified");
        item.put("listing_type_id", "silver");
        item.put("condition", "used");
        item.put("channels", List.of("marketplace"));

        if (property.getGallery() != null && !property.getGallery().isBlank()) {
            String[] images = property.getGallery().split("\\n");
            List<Map<String, Object>> pictures = new ArrayList<>();
            for (String img : images) {
                String trimmed = img.trim();
                if (!trimmed.isEmpty()) {
                    pictures.add(Map.of("source", trimmed));
                }
            }
            if (!pictures.isEmpty()) {
                item.put("pictures", pictures);
            }
        }

        Map<String, String> contact = new LinkedHashMap<>();
        contact.put("contact", contactName);
        if (contactPhone != null && !contactPhone.isBlank()) {
            contact.put("phone", contactPhone);
        }
        contact.put("email", contactEmail);
        item.put("seller_contact", contact);

        Map<String, Object> location = new LinkedHashMap<>();

        location.put("country", Map.of("id", "CL", "name", "Chile"));
        location.put("state", Map.of("id", "TUxDUE1FVEExM2JlYg", "name", "Región Metropolitana de Santiago"));

        String cityName = property.getCity();
        if (cityName == null || cityName.isBlank()) cityName = property.getNeighborhood();
        if (cityName != null && !cityName.isBlank()) {
            String cityId = resolveCityId(cityName);
            location.put("city", Map.of("id", cityId, "name", cityName));
        }

        String addressLine = property.getLocation();
        if (property.getNeighborhood() != null && !property.getNeighborhood().isBlank()) {
            addressLine = (addressLine != null ? addressLine : "") + ", " + property.getNeighborhood();
        }
        if (cityName != null && !cityName.isBlank()) {
            addressLine = (addressLine != null ? addressLine : "") + ", " + cityName;
        }
        if (addressLine != null && !addressLine.isBlank()) {
            location.put("address_line", addressLine);
        }
        if (property.getLat() != null) location.put("latitude", property.getLat());
        if (property.getLng() != null) location.put("longitude", property.getLng());

        item.put("location", location);

        List<Map<String, Object>> attributes = new ArrayList<>();

        if (property.getBeds() != null) {
            attributes.add(buildNumberAttribute("BEDROOMS", "Dormitorios", property.getBeds()));
        }
        if (property.getBaths() != null) {
            attributes.add(buildNumberAttribute("FULL_BATHROOMS", "Baños", property.getBaths()));
        }
        if (property.getParking() != null) {
            attributes.add(buildNumberAttribute("PARKING_LOTS", "Estacionamientos", property.getParking()));
        }
        if (property.getArea() != null) {
            attributes.add(buildAreaAttribute("COVERED_AREA", "Superficie útil", property.getArea()));
        }
        if (property.getLandArea() != null) {
            attributes.add(buildAreaAttribute("TOTAL_AREA", "Superficie total", property.getLandArea()));
        }
        if (property.getRooms() != null) {
            attributes.add(buildNumberAttribute("ROOMS", "Ambientes", property.getRooms()));
        }
        if (property.getExpenses() != null && !property.getExpenses().isBlank()) {
            try {
                double expenses = Double.parseDouble(property.getExpenses().replace(".", "").replace(",", "."));
                attributes.add(buildNumberAttribute("MAINTENANCE_FEE", "Gastos comunes", (int) expenses));
            } catch (NumberFormatException ignored) {
            }
        }
        if (property.getPetsAllowed() != null) {
            attributes.add(buildBooleanAttribute("IS_SUITABLE_FOR_PETS", "Admite mascotas", property.getPetsAllowed()));
        }
        if (property.getFurnished() != null) {
            attributes.add(buildBooleanAttribute("FURNISHED", "Amoblado", property.getFurnished()));
        }
        if (property.getWarehouses() != null) {
            attributes.add(buildNumberAttribute("WAREHOUSES", "Bodegas", property.getWarehouses()));
        }
        if (property.getBuiltYear() != null) {
            attributes.add(buildNumberAttribute("YEAR", "Año de construcción", property.getBuiltYear()));
        }
        if (property.getFloor() != null && !property.getFloor().isBlank()) {
            try {
                int floorNum = Integer.parseInt(property.getFloor().replaceAll("[^0-9]", ""));
                attributes.add(buildNumberAttribute("FLOOR_NUMBER", "Piso", floorNum));
            } catch (NumberFormatException ignored) {
            }
        }
        if (property.getBuildingFloors() != null && !property.getBuildingFloors().isBlank()) {
            try {
                int totalFloors = Integer.parseInt(property.getBuildingFloors().replaceAll("[^0-9]", ""));
                attributes.add(buildNumberAttribute("TOTAL_FLOORS", "Total de pisos", totalFloors));
            } catch (NumberFormatException ignored) {
            }
        }

        attributes.add(buildFullAttribute("CMG_SITE", "Sitio de origen", null, "POI", "OTHERS", "Otros"));

        item.put("attributes", attributes);

        if (property.getDescription() != null && !property.getDescription().isBlank()) {
            item.put("description", Map.of("plain_text", property.getDescription()));
        }

        return item;
    }

    private Map<String, Object> buildFullAttribute(String id, String name, String valueId, String valueName, String groupId, String groupName) {
        Map<String, Object> attr = new LinkedHashMap<>();
        attr.put("id", id);
        attr.put("name", name);
        attr.put("value_id", valueId);
        attr.put("value_name", valueName);
        attr.put("value_struct", null);

        Map<String, Object> valueEntry = new LinkedHashMap<>();
        valueEntry.put("id", valueId);
        valueEntry.put("name", valueName);
        valueEntry.put("struct", null);
        attr.put("values", List.of(valueEntry));

        attr.put("attribute_group_id", groupId);
        attr.put("attribute_group_name", groupName);
        return attr;
    }

    private Map<String, Object> buildNumberAttribute(String id, String name, int value) {
        String strValue = String.valueOf(value);
        Map<String, Object> attr = new LinkedHashMap<>();
        attr.put("id", id);
        attr.put("name", name);
        attr.put("value_id", null);
        attr.put("value_name", strValue);
        attr.put("value_struct", null);

        Map<String, Object> valueEntry = new LinkedHashMap<>();
        valueEntry.put("id", null);
        valueEntry.put("name", strValue);
        valueEntry.put("struct", null);
        attr.put("values", List.of(valueEntry));

        attr.put("attribute_group_id", "FIND");
        attr.put("attribute_group_name", "Ficha técnica");
        return attr;
    }

    private Map<String, Object> buildAreaAttribute(String id, String name, int value) {
        String strValue = value + " m\u00b2";
        Map<String, Object> struct = new LinkedHashMap<>();
        struct.put("number", value);
        struct.put("unit", "m\u00b2");

        Map<String, Object> attr = new LinkedHashMap<>();
        attr.put("id", id);
        attr.put("name", name);
        attr.put("value_id", null);
        attr.put("value_name", strValue);
        attr.put("value_struct", struct);

        Map<String, Object> valueEntry = new LinkedHashMap<>();
        valueEntry.put("id", null);
        valueEntry.put("name", strValue);
        valueEntry.put("struct", struct);
        attr.put("values", List.of(valueEntry));

        attr.put("attribute_group_id", "FIND");
        attr.put("attribute_group_name", "Ficha técnica");
        return attr;
    }

    private Map<String, Object> buildBooleanAttribute(String id, String name, boolean value) {
        String valueName = value ? "S\u00ed" : "No";
        String valueId = value ? "242085" : "242084";
        Map<String, Object> attr = new LinkedHashMap<>();
        attr.put("id", id);
        attr.put("name", name);
        attr.put("value_id", valueId);
        attr.put("value_name", valueName);
        attr.put("value_struct", null);

        Map<String, Object> valueEntry = new LinkedHashMap<>();
        valueEntry.put("id", valueId);
        valueEntry.put("name", valueName);
        valueEntry.put("struct", null);
        attr.put("values", List.of(valueEntry));

        attr.put("attribute_group_id", "FIND");
        attr.put("attribute_group_name", "Ficha técnica");
        return attr;
    }

    private String resolveCategoryId(String type, String operation) {
        String normalizedType = "Parcela".equals(type) ? "Parcela agrícola" : type;
        String normalizedOp = "Comprar".equals(operation) ? "Venta" : operation;

        Map<String, Map<String, String>> categories = Map.of(
            "Casa", Map.of("Venta", "MLC157520", "Arriendo", "MLC183184"),
            "Departamento", Map.of("Venta", "MLC157522", "Arriendo", "MLC183186"),
            "Oficina", Map.of("Venta", "MLC157413", "Arriendo", "MLC183187"),
            "Local comercial", Map.of("Venta", "MLC50612", "Arriendo", "MLC50611"),
            "Terreno", Map.of("Venta", "MLC152993", "Arriendo", "MLC152994"),
            "Parcela agrícola", Map.of("Venta", "MLC458189", "Arriendo", "MLC6404"),
            "Estacionamiento", Map.of("Venta", "MLC50622", "Arriendo", "MLC50621")
        );

        Map<String, String> typeMap = categories.getOrDefault(normalizedType, Map.of());
        return typeMap.getOrDefault(normalizedOp, "MLC1459");
    }

    private String resolvePropertyTypeId(String type) {
        String normalized = "Parcela".equals(type) ? "Parcela agrícola" : type;
        return switch (normalized) {
            case "Casa" -> "242060";
            case "Departamento" -> "242062";
            case "Oficina" -> "242065";
            case "Local comercial" -> "242067";
            case "Terreno" -> "242064";
            case "Parcela agrícola" -> "242068";
            case "Estacionamiento" -> "242066";
            default -> "242060";
        };
    }

    private String resolveOperationId(String operation) {
        return "Arriendo".equals(operation) ? "242073" : "242075";
    }

    @SuppressWarnings("unchecked")
    private String resolveCityId(String cityName) {
        String cached = cityIdCache.get(cityName.toLowerCase());
        if (cached != null) return cached;

        try {
            String url = ML_API_URL + "/sites/" + siteId + "/cities?q=" + java.net.URLEncoder.encode(cityName, java.nio.charset.StandardCharsets.UTF_8) + "&limit=1";
            ResponseEntity<Map> response = restTemplate.getForEntity(url, Map.class);
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                Map<String, Object> body = response.getBody();
                Object results = body.get("results");
                if (results instanceof List<?> list && !list.isEmpty() && list.get(0) instanceof Map<?, ?> first) {
                    String id = (String) first.get("id");
                    if (id != null) {
                        cityIdCache.put(cityName.toLowerCase(), id);
                        return id;
                    }
                }
            }
        } catch (Exception e) {
            // Fallback: return generic city ID for Región Metropolitana
        }

        String fallback = "TUxDQ1NU";
        cityIdCache.put(cityName.toLowerCase(), fallback);
        return fallback;
    }
}
