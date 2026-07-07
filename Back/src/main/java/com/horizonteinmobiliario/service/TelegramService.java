package com.horizonteinmobiliario.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
public class TelegramService {

    private static final Logger log = LoggerFactory.getLogger(TelegramService.class);
    private final RestTemplate rest = new RestTemplate();
    private final String apiUrl;
    private final String chatId;
    private final boolean enabled;

    public TelegramService(@Value("${telegram.bot.token}") String token,
                           @Value("${telegram.bot.chat-id}") String chatId) {
        boolean valid = token != null && !token.isBlank() && !"TU_TOKEN_AQUI".equals(token);
        this.enabled = valid;
        this.apiUrl = valid ? "https://api.telegram.org/bot" + token : null;
        this.chatId = valid ? chatId : null;
        if (!valid) log.info("Telegram service disabled: no valid token configured");
    }

    public void sendMessage(String chatId, String text) {
        if (!enabled) return;
        try {
            String url = apiUrl + "/sendMessage?chat_id=" + chatId + "&text=" + java.net.URLEncoder.encode(text, "UTF-8") + "&parse_mode=HTML";
            rest.postForEntity(url, null, String.class);
        } catch (Exception e) {
            log.error("Telegram send error: {}", e.getMessage());
        }
    }

    public void notifyNewContact(String name, String email, String phone, String message, String type) {
        String text = """
            <b>📩 Nuevo contacto - %s</b>
            <b>Nombre:</b> %s
            <b>Email:</b> %s
            <b>Teléfono:</b> %s
            <b>Mensaje:</b> %s
            """.formatted(type, name, email, phone, message);
        sendMessage(chatId, text);
    }
}
