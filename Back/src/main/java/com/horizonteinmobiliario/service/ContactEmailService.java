package com.horizonteinmobiliario.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@Async
public class ContactEmailService {

    private static final Logger log = LoggerFactory.getLogger(ContactEmailService.class);

    private final JavaMailSender mailSender;
    private final String emailFrom;
    private final List<String> recipients;

    public ContactEmailService(
            JavaMailSender mailSender,
            @Value("${app.email.from}") String emailFrom,
            @Value("${app.contact.emails}") String contactEmails) {
        this.mailSender = mailSender;
        this.emailFrom = emailFrom;
        String trimmed = contactEmails.trim();
        this.recipients = trimmed.isEmpty() ? List.of() : List.of(trimmed.split("\\s*,\\s*"));
    }

    public void notifyNewContact(String name, String email, String phone, String message, String type) {
        if (emailFrom == null || emailFrom.isBlank()) {
            log.warn("EMAIL_FROM no configurado, no se envía correo de contacto");
            return;
        }
        if (recipients.isEmpty()) {
            log.warn("CONTACT_EMAILS vacío, no se envía correo de contacto");
            return;
        }

        String subject = "\uD83D\uDCE9 Nuevo contacto - " + type;
        String body = """
                📩 Nuevo contacto - %s

                Nombre: %s
                Email: %s
                Teléfono: %s
                Mensaje: %s

                Tipo: %s
                """.formatted(type, name, email, phone, message, type);

        for (String to : recipients) {
            try {
                SimpleMailMessage msg = new SimpleMailMessage();
                msg.setTo(to);
                msg.setFrom(emailFrom);
                msg.setSubject(subject);
                msg.setText(body);
                mailSender.send(msg);
                log.info("Correo de contacto enviado a {}", to);
            } catch (Exception e) {
                log.error("Error al enviar correo de contacto a {}: {}", to, e.getMessage());
            }
        }
    }
}
