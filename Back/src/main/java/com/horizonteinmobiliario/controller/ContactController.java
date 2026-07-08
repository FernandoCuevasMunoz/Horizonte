package com.horizonteinmobiliario.controller;

import com.horizonteinmobiliario.model.ContactMessage;
import com.horizonteinmobiliario.repository.ContactMessageRepository;
import com.horizonteinmobiliario.service.ContactEmailService;
import com.horizonteinmobiliario.service.TelegramService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/contact")
public class ContactController {

    private final ContactMessageRepository repo;
    private final TelegramService telegram;
    private final ContactEmailService contactEmail;

    public ContactController(ContactMessageRepository repo, TelegramService telegram, ContactEmailService contactEmail) {
        this.repo = repo;
        this.telegram = telegram;
        this.contactEmail = contactEmail;
    }

    @PostMapping
    public ResponseEntity<?> receive(@Valid @RequestBody ContactRequest req) {
        ContactMessage msg = new ContactMessage();
        msg.setName(req.name());
        msg.setEmail(req.email());
        msg.setPhone(req.phone());
        msg.setMessage(req.message());
        msg.setType(req.type() != null ? req.type() : "contacto");
        repo.save(msg);

        telegram.notifyNewContact(req.name(), req.email(), req.phone(), req.message(), msg.getType());
        contactEmail.notifyNewContact(req.name(), req.email(), req.phone(), req.message(), msg.getType());

        return ResponseEntity.ok(java.util.Map.of("status", "ok"));
    }

    public record ContactRequest(
            @NotBlank String name,
            @NotBlank @Email String email,
            String phone,
            @NotBlank String message,
            String type) {}
}
