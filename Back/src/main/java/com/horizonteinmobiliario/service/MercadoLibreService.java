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
            return Map.of("error", e.getMessage());
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
        } catch (Exception e) {
            return Map.of("error", e.getMessage());
        }
        return Map.of("error", "Failed to publish");
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
            return Map.of("error", e.getMessage());
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
            String[] images = property.getGallery().split(",");
            List<Map<String, String>> pictures = new ArrayList<>();
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
        String fullLocation = property.getLocation();
        if (property.getNeighborhood() != null && !property.getNeighborhood().isBlank()) {
            fullLocation = (fullLocation != null ? fullLocation : "") + ", " + property.getNeighborhood();
        }
        if (fullLocation != null) {
            location.put("address_line", fullLocation);
        }
        if (property.getLat() != null) location.put("latitude", property.getLat());
        if (property.getLng() != null) location.put("longitude", property.getLng());
        if (!location.isEmpty()) {
            item.put("location", location);
        }

        List<Map<String, Object>> attributes = new ArrayList<>();
        if (property.getBeds() != null) attributes.add(Map.of("id", "BEDROOMS", "value_name", String.valueOf(property.getBeds())));
        if (property.getBaths() != null) attributes.add(Map.of("id", "FULL_BATHROOMS", "value_name", String.valueOf(property.getBaths())));
        if (property.getParking() != null) attributes.add(Map.of("id", "PARKING_LOTS", "value_name", String.valueOf(property.getParking())));
        if (property.getArea() != null) attributes.add(Map.of("id", "COVERED_AREA", "value_name", property.getArea() + " m²"));
        if (property.getLandArea() != null) attributes.add(Map.of("id", "TOTAL_AREA", "value_name", property.getLandArea() + " m²"));
        if (property.getRooms() != null) attributes.add(Map.of("id", "ROOMS", "value_name", String.valueOf(property.getRooms())));
        if (property.getExpenses() != null && !property.getExpenses().isBlank()) {
            attributes.add(Map.of("id", "MAINTENANCE_FEE", "value_name", property.getExpenses()));
        }
        if (property.getPetsAllowed() != null) attributes.add(Map.of("id", "IS_SUITABLE_FOR_PETS", "value_name", property.getPetsAllowed() ? "Sí" : "No"));
        if (property.getFurnished() != null) attributes.add(Map.of("id", "FURNISHED", "value_name", property.getFurnished() ? "Sí" : "No"));
        if (property.getWarehouses() != null) attributes.add(Map.of("id", "WAREHOUSES", "value_name", String.valueOf(property.getWarehouses())));

        attributes.add(Map.of("id", "PROPERTY_TYPE", "value_id", resolvePropertyTypeId(property.getType()), "value_name", property.getType()));
        attributes.add(Map.of("id", "OPERATION", "value_id", resolveOperationId(property.getOperation()), "value_name", property.getOperation()));
        attributes.add(Map.of("id", "OPERATION_SUBTYPE", "value_id", "244562", "value_name", "Propiedad individual"));
        attributes.add(Map.of("id", "CMG_SITE", "value_name", "POI"));

        item.put("attributes", attributes);

        if (property.getDescription() != null && !property.getDescription().isBlank()) {
            item.put("description", Map.of("plain_text", property.getDescription()));
        }

        return item;
    }

    private String resolveCategoryId(String type, String operation) {
        Map<String, Map<String, String>> categories = Map.of(
            "Casa", Map.of("Venta", "MLC401685", "Arriendo", "MLC401684"),
            "Departamento", Map.of("Venta", "MLC401689", "Arriendo", "MLC401688"),
            "Oficina", Map.of("Venta", "MLC401693", "Arriendo", "MLC401692"),
            "Local comercial", Map.of("Venta", "MLC401697", "Arriendo", "MLC401696"),
            "Terreno", Map.of("Venta", "MLC401701", "Arriendo", "MLC401700"),
            "Parcela agrícola", Map.of("Venta", "MLC401705", "Arriendo", "MLC401704"),
            "Estacionamiento", Map.of("Venta", "MLC401709", "Arriendo", "MLC401708")
        );

        Map<String, String> typeMap = categories.getOrDefault(type, Map.of());
        return typeMap.getOrDefault(operation, "MLC1459");
    }

    private String resolvePropertyTypeId(String type) {
        return switch (type) {
            case "Casa" -> "242076";
            case "Departamento" -> "242077";
            case "Oficina" -> "242078";
            case "Local comercial" -> "242080";
            case "Terreno" -> "242079";
            case "Parcela agrícola" -> "242081";
            case "Estacionamiento" -> "242082";
            default -> "242076";
        };
    }

    private String resolveOperationId(String operation) {
        return "Arriendo".equals(operation) ? "242075" : "242075";
    }
}
