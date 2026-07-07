package com.horizonteinmobiliario.telegram;

import com.horizonteinmobiliario.model.Property;
import com.horizonteinmobiliario.repository.PropertyRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;


@Component
public class HorizonteBot {

    private static final Logger log = LoggerFactory.getLogger(HorizonteBot.class);
    private final RestTemplate rest = new RestTemplate();
    private final String apiUrl;
    private final PropertyRepository propertyRepo;
    private final boolean enabled;
    private long lastUpdateId = 0;

    public HorizonteBot(
            @Value("${telegram.bot.token}") String token,
            PropertyRepository propertyRepo) {
        boolean valid = token != null && !token.isBlank() && !"TU_TOKEN_AQUI".equals(token);
        this.enabled = valid;
        this.apiUrl = valid ? "https://api.telegram.org/bot" + token : null;
        this.propertyRepo = propertyRepo;
        if (!valid) log.info("Telegram bot disabled: no valid token configured");
    }

    @Scheduled(fixedRate = 2000)
    public void poll() {
        if (!enabled) return;
        try {
            String url = apiUrl + "/getUpdates?offset=" + (lastUpdateId + 1) + "&timeout=30";
            ResponseEntity<Map> response = rest.getForEntity(url, Map.class);

            if (response.getBody() == null || !response.getBody().containsKey("result")) return;

            List<Map<String, Object>> updates = (List<Map<String, Object>>) response.getBody().get("result");
            if (updates == null || updates.isEmpty()) return;

            for (Map<String, Object> update : updates) {
                Object rawId = update.get("update_id");
                if (rawId == null) continue;
                long updateId = ((Number) rawId).longValue();
                if (updateId <= lastUpdateId) continue;
                lastUpdateId = updateId;

                Map<String, Object> message = (Map<String, Object>) update.get("message");
                if (message == null) continue;

                Map<String, Object> chat = (Map<String, Object>) message.get("chat");
                String chatId = String.valueOf(((Number) chat.get("id")).longValue());

                String text = (String) message.get("text");
                if (text == null) continue;

                handleCommand(chatId, text.trim());
            }
        } catch (Exception e) {
            log.warn("Telegram poll error: {}", e.getMessage());
        }
    }

    private void handleCommand(String chatId, String text) {
        if (text.startsWith("/start")) {
            send(chatId, """
                ¡Bienvenido a <b>Horizonte Inmobiliario</b>! 🏡
                
                Comandos disponibles:
                /start — Ver este mensaje
                /listar — Listar propiedades destacadas
                /buscar [tipo] — Buscar por tipo (Casa, Departamento, etc.)
                /ayuda — Ver ayuda
                """);
        } else if (text.startsWith("/listar")) {
            List<Property> featured = propertyRepo.findByFeaturedTrue();
            if (featured.isEmpty()) {
                send(chatId, "No hay propiedades destacadas actualmente.");
            } else {
                StringBuilder sb = new StringBuilder("<b>🏠 Propiedades Destacadas:</b>\n\n");
                for (Property p : featured) {
                    sb.append("• <b>").append(p.getTitle()).append("</b>\n");
                    sb.append("  ").append(p.getPrice()).append(" | ").append(p.getLocation()).append("\n\n");
                }
                send(chatId, sb.toString());
            }
        } else if (text.startsWith("/buscar")) {
            String tipo = text.replace("/buscar", "").trim();
            if (tipo.isEmpty()) {
                send(chatId, "Ejemplo: <code>/buscar Departamento</code>");
                return;
            }
            List<Property> result = propertyRepo.findByType(tipo);
            if (result.isEmpty()) {
                send(chatId, "No encontré propiedades de tipo: " + tipo);
            } else {
                StringBuilder sb = new StringBuilder("<b>📋 Resultados para " + tipo + ":</b>\n\n");
                for (Property p : result) {
                    sb.append("• <b>").append(p.getTitle()).append("</b>\n");
                    sb.append("  ").append(p.getPrice()).append(" | ").append(p.getLocation()).append("\n");
                    sb.append("  ").append(p.getBeds()).append("D ").append(p.getBaths()).append("B | ").append(p.getArea()).append("m²\n\n");
                }
                send(chatId, sb.toString());
            }
        } else if (text.startsWith("/ayuda")) {
            send(chatId, """
                <b>Comandos disponibles:</b>
                /start — Bienvenida
                /listar — Propiedades destacadas
                /buscar [tipo] — Ej: /buscar Casa
                /ayuda — Este mensaje
                """);
        } else {
            send(chatId, "Comando no reconocido. Usa /ayuda para ver los disponibles.");
        }
    }

    private void send(String chatId, String text) {
        try {
            String url = apiUrl + "/sendMessage?chat_id=" + chatId
                    + "&text=" + java.net.URLEncoder.encode(text, "UTF-8")
                    + "&parse_mode=HTML";
            rest.postForEntity(url, null, String.class);
        } catch (Exception e) {
            System.err.println("Telegram send error: " + e.getMessage());
        }
    }
}
