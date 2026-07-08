package com.horizonteinmobiliario.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;

@Service
public class ResendEmailClient {

    private static final Logger log = LoggerFactory.getLogger(ResendEmailClient.class);

    private final RestTemplate rest = new RestTemplate();
    private final String apiKey;

    public ResendEmailClient(@Value("${resend.api.key:}") String apiKey) {
        this.apiKey = apiKey;
    }

    public boolean send(String from, String to, String subject, String text) {
        if (apiKey == null || apiKey.isBlank()) {
            log.warn("RESEND_API_KEY no configurada, no se envía correo");
            return false;
        }

        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setBearerAuth(apiKey);
            headers.setContentType(MediaType.APPLICATION_JSON);

            Map<String, Object> body = Map.of(
                    "from", from,
                    "to", List.of(to),
                    "subject", subject,
                    "text", text
            );

            HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);
            rest.postForEntity("https://api.resend.com/emails", request, String.class);
            log.info("Correo enviado a {}", to);
            return true;
        } catch (Exception e) {
            log.error("Error al enviar correo a {}: {}", to, e.getMessage());
            return false;
        }
    }
}
