package com.horizonteinmobiliario.controller;

import com.horizonteinmobiliario.service.MercadoLibreService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.Map;

@RestController
@RequestMapping("/api/ml")
public class MercadoLibreController {

    private final MercadoLibreService mlService;

    public MercadoLibreController(MercadoLibreService mlService) {
        this.mlService = mlService;
    }

    @GetMapping("/auth-url")
    public ResponseEntity<?> getAuthUrl() {
        String url = mlService.getAuthUrl();
        return ResponseEntity.ok(Map.of("url", url));
    }

    @GetMapping("/callback")
    public void handleCallback(@RequestParam("code") String code, HttpServletResponse response) throws IOException {
        Map<String, Object> result = mlService.exchangeCodeForToken(code);
        if (result.containsKey("error")) {
            response.sendRedirect("/admin/propiedades?ml=error");
        } else {
            response.sendRedirect("/admin/propiedades?ml=connected");
        }
    }

    @PostMapping("/publish/{propertyId}")
    public ResponseEntity<?> publishProperty(@PathVariable Long propertyId) {
        Map<String, Object> result = mlService.publishProperty(propertyId);
        if (result.containsKey("error")) {
            return ResponseEntity.badRequest().body(result);
        }
        return ResponseEntity.ok(result);
    }

    @PostMapping("/unpublish/{propertyId}")
    public ResponseEntity<?> unpublishProperty(@PathVariable Long propertyId) {
        Map<String, Object> result = mlService.unpublishProperty(propertyId);
        if (result.containsKey("error")) {
            return ResponseEntity.badRequest().body(result);
        }
        return ResponseEntity.ok(result);
    }

    @GetMapping("/status")
    public ResponseEntity<?> getMLStatus() {
        return ResponseEntity.ok(mlService.getMLStatus());
    }

    @GetMapping("/property/{propertyId}/status")
    public ResponseEntity<?> getPropertyStatus(@PathVariable Long propertyId) {
        return ResponseEntity.ok(mlService.getPropertyStatus(propertyId));
    }

    @PostMapping("/notifications")
    public ResponseEntity<?> handleNotifications(HttpServletRequest request) {
        return ResponseEntity.ok(Map.of("status", "received"));
    }
}
