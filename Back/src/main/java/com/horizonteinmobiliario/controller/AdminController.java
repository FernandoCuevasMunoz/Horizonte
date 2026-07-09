package com.horizonteinmobiliario.controller;

import com.horizonteinmobiliario.model.ContactMessage;
import com.horizonteinmobiliario.model.Property;
import com.horizonteinmobiliario.repository.ContactMessageRepository;
import com.horizonteinmobiliario.repository.PropertyRepository;
import com.horizonteinmobiliario.service.AdminAuthService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final AdminAuthService auth;
    private final PropertyRepository propertyRepo;
    private final ContactMessageRepository contactRepo;

    public AdminController(AdminAuthService auth, PropertyRepository propertyRepo, ContactMessageRepository contactRepo) {
        this.auth = auth;
        this.propertyRepo = propertyRepo;
        this.contactRepo = contactRepo;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> body, HttpServletRequest request) {
        String ip = getClientIp(request);

        if (auth.isBlocked(ip)) {
            int remaining = auth.remainingAttempts(ip);
            return ResponseEntity.status(429).body(Map.of(
                "error", "Demasiados intentos. Intenta de nuevo en 15 minutos.",
                "remainingBlocked", remaining
            ));
        }

        String token = auth.login(body.get("password"), ip);
        if (token == null) {
            int remaining = auth.remainingAttempts(ip);
            return ResponseEntity.status(401).body(Map.of(
                "error", "Contraseña incorrecta",
                "remainingAttempts", remaining
            ));
        }

        return ResponseEntity.ok(Map.of("token", token));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword() {
        String code = auth.generateResetCode();
        auth.sendResetEmail(code);
        return ResponseEntity.ok(Map.of("message", "Si el email está registrado, recibirás un código de recuperación."));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody Map<String, String> body) {
        String code = body.get("code");
        String newPassword = body.get("newPassword");
        if (code == null || code.isBlank() || newPassword == null || newPassword.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Código y nueva contraseña son requeridos"));
        }
        if (newPassword.length() < 6) {
            return ResponseEntity.badRequest().body(Map.of("error", "La contraseña debe tener al menos 6 caracteres"));
        }
        boolean ok = auth.resetPassword(code, newPassword);
        if (!ok) {
            return ResponseEntity.badRequest().body(Map.of("error", "Código inválido o expirado"));
        }
        return ResponseEntity.ok(Map.of("message", "Contraseña actualizada exitosamente"));
    }

    @GetMapping("/verify")
    public ResponseEntity<?> verify(@RequestHeader("Authorization") String authHeader) {
        if (!validateToken(authHeader)) return ResponseEntity.status(401).body(Map.of("error", "No autorizado"));
        return ResponseEntity.ok(Map.of("ok", true));
    }

    @GetMapping("/messages")
    public ResponseEntity<?> getMessages(@RequestHeader("Authorization") String authHeader) {
        if (!validateToken(authHeader)) return ResponseEntity.status(401).body(Map.of("error", "No autorizado"));
        List<ContactMessage> messages = contactRepo.findAll();
        return ResponseEntity.ok(messages);
    }

    @PutMapping("/properties/{id}")
    public ResponseEntity<?> updateProperty(@RequestHeader("Authorization") String authHeader,
                                             @PathVariable Long id,
                                             @RequestBody Property property) {
        if (!validateToken(authHeader)) return ResponseEntity.status(401).body(Map.of("error", "No autorizado"));
        return propertyRepo.findById(id).map(existing -> {
            if (property.getTitle() != null) existing.setTitle(property.getTitle());
            if (property.getType() != null) existing.setType(property.getType());
            if (property.getOperation() != null) existing.setOperation(property.getOperation());
            if (property.getPrice() != null) existing.setPrice(property.getPrice());
            if (property.getNumericPrice() != null) existing.setNumericPrice(property.getNumericPrice());
            if (property.getLocation() != null) existing.setLocation(property.getLocation());
            if (property.getNeighborhood() != null) existing.setNeighborhood(property.getNeighborhood());
            if (property.getBeds() != null) existing.setBeds(property.getBeds());
            if (property.getBaths() != null) existing.setBaths(property.getBaths());
            if (property.getArea() != null) existing.setArea(property.getArea());
            if (property.getLandArea() != null) existing.setLandArea(property.getLandArea());
            if (property.getBuiltYear() != null) existing.setBuiltYear(property.getBuiltYear());
            if (property.getBuildingFloors() != null) existing.setBuildingFloors(property.getBuildingFloors());
            if (property.getParking() != null) existing.setParking(property.getParking());
            if (property.getExpenses() != null) existing.setExpenses(property.getExpenses());
            if (property.getContributions() != null) existing.setContributions(property.getContributions());
            if (property.getNearby() != null) existing.setNearby(property.getNearby());
            if (property.getImage() != null) existing.setImage(property.getImage());
            if (property.getGallery() != null) existing.setGallery(property.getGallery());
            if (property.getEquipment() != null) existing.setEquipment(property.getEquipment());
            if (property.getCommunity() != null) existing.setCommunity(property.getCommunity());
            if (property.getFeatured() != null) existing.setFeatured(property.getFeatured());
            if (property.getCode() != null) existing.setCode(property.getCode());
            if (property.getRegion() != null) existing.setRegion(property.getRegion());
            if (property.getOrientation() != null) existing.setOrientation(property.getOrientation());
            if (property.getFloor() != null) existing.setFloor(property.getFloor());
            if (property.getRecentWork() != null) existing.setRecentWork(property.getRecentWork());
            if (property.getLat() != null) existing.setLat(property.getLat());
            if (property.getLng() != null) existing.setLng(property.getLng());
            if (property.getDescription() != null) existing.setDescription(property.getDescription());
            propertyRepo.save(existing);
            return ResponseEntity.ok(existing);
        }).orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/properties")
    public ResponseEntity<?> createProperty(@RequestHeader("Authorization") String authHeader,
                                             @RequestBody Property property) {
        if (!validateToken(authHeader)) return ResponseEntity.status(401).body(Map.of("error", "No autorizado"));
        Property saved = propertyRepo.save(property);
        return ResponseEntity.ok(saved);
    }

    @DeleteMapping("/properties/{id}")
    public ResponseEntity<?> deleteProperty(@RequestHeader("Authorization") String authHeader,
                                             @PathVariable Long id) {
        if (!validateToken(authHeader)) return ResponseEntity.status(401).body(Map.of("error", "No autorizado"));
        if (propertyRepo.findById(id).isEmpty()) return ResponseEntity.notFound().build();
        propertyRepo.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    private boolean validateToken(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) return false;
        return auth.validate(authHeader.substring(7));
    }

    private String getClientIp(HttpServletRequest request) {
        String xff = request.getHeader("X-Forwarded-For");
        if (xff != null && !xff.isBlank()) return xff.split(",")[0].trim();
        return request.getRemoteAddr();
    }
}
