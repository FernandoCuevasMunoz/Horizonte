package com.horizonteinmobiliario.service;

import com.horizonteinmobiliario.model.AdminSetting;
import com.horizonteinmobiliario.repository.AdminSettingRepository;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.Instant;
import java.util.Base64;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class AdminAuthService {

    private static final Logger log = LoggerFactory.getLogger(AdminAuthService.class);
    private static final int MAX_ATTEMPTS = 5;
    private static final long BLOCK_DURATION_MS = 15 * 60 * 1000; // 15 min
    private static final long ATTEMPT_WINDOW_MS = 15 * 60 * 1000;
    private static final long RESET_CODE_EXPIRY_MS = 15 * 60 * 1000; // 15 min

    private String adminPassword;
    private final String defaultPassword;
    private final JavaMailSender mailSender;
    private final String adminEmail;
    private final String emailFrom;
    private final AdminSettingRepository settingRepo;

    private final Map<String, Long> tokens = new ConcurrentHashMap<>();
    private final Map<String, AttemptInfo> attempts = new ConcurrentHashMap<>();
    private final Map<String, ResetInfo> resetCodes = new ConcurrentHashMap<>();

    public AdminAuthService(
            @Value("${admin.password}") String adminPassword,
            @Value("${app.admin.email}") String adminEmail,
            @Value("${app.email.from}") String emailFrom,
            JavaMailSender mailSender,
            AdminSettingRepository settingRepo) {
        this.defaultPassword = adminPassword;
        this.adminEmail = adminEmail;
        this.emailFrom = emailFrom;
        this.mailSender = mailSender;
        this.settingRepo = settingRepo;
    }

    @PostConstruct
    public void init() {
        String saved = settingRepo.findById("admin.password")
                .map(AdminSetting::getValue)
                .orElse(null);
        adminPassword = (saved != null && !saved.isBlank()) ? saved : defaultPassword;
    }

    // ── Rate-limited login ──────────────────────────────────────────────

    public String login(String password, String ip) {
        if (ip != null) {
            long now = Instant.now().toEpochMilli();
            AttemptInfo info = attempts.get(ip);
            if (info != null && now <= info.blockedUntil) return null;
        }

        if (!adminPassword.equals(password)) {
            if (ip != null) recordFailure(ip);
            return null;
        }

        if (ip != null) attempts.remove(ip);
        String token = generateToken();
        tokens.put(token, Instant.now().toEpochMilli());
        return token;
    }

    public boolean isBlocked(String ip) {
        AttemptInfo info = attempts.get(ip);
        if (info == null) return false;
        if (Instant.now().toEpochMilli() > info.blockedUntil) {
            attempts.remove(ip);
            return false;
        }
        return true;
    }

    public int remainingAttempts(String ip) {
        AttemptInfo info = attempts.get(ip);
        if (info == null) return MAX_ATTEMPTS;
        if (Instant.now().toEpochMilli() > info.blockedUntil) {
            attempts.remove(ip);
            return MAX_ATTEMPTS;
        }
        return Math.max(0, MAX_ATTEMPTS - info.count);
    }

    private void recordFailure(String ip) {
        long now = Instant.now().toEpochMilli();
        attempts.compute(ip, (key, info) -> {
            if (info == null || now - info.firstAttempt > ATTEMPT_WINDOW_MS) {
                info = new AttemptInfo(1, now, 0);
            } else {
                info = new AttemptInfo(info.count + 1, info.firstAttempt, info.blockedUntil);
            }
            if (info.count >= MAX_ATTEMPTS) {
                info = new AttemptInfo(info.count, info.firstAttempt, now + BLOCK_DURATION_MS);
                log.warn("IP {} bloqueada por {} min ({} intentos fallidos)", ip, BLOCK_DURATION_MS / 60000, info.count);
            }
            return info;
        });
    }

    // ── Token validation ────────────────────────────────────────────────

    public boolean validate(String token) {
        if (token == null || token.isBlank()) return false;
        Long createdAt = tokens.get(token);
        if (createdAt == null) return false;
        if (Instant.now().toEpochMilli() - createdAt > 86_400_000) {
            tokens.remove(token);
            return false;
        }
        return true;
    }

    // ── Password reset ──────────────────────────────────────────────────

    public String generateResetCode() {
        String code = generateToken().substring(0, 8); // 8-char code
        resetCodes.put(code, new ResetInfo(code, Instant.now().toEpochMilli()));
        return code;
    }

    public boolean resetPassword(String code, String newPassword) {
        ResetInfo info = resetCodes.remove(code);
        if (info == null) return false;
        if (Instant.now().toEpochMilli() - info.createdAt > RESET_CODE_EXPIRY_MS) {
            return false;
        }
        adminPassword = newPassword;
        settingRepo.save(new AdminSetting("admin.password", newPassword));
        tokens.clear();
        log.info("Contraseña de admin actualizada exitosamente");
        return true;
    }

    public void sendResetEmail(String code) {
        if (emailFrom == null || emailFrom.isBlank()) {
            log.warn("SMTP no configurado — código de recuperación: {}", code);
            return;
        }
        try {
            SimpleMailMessage msg = new SimpleMailMessage();
            msg.setTo(adminEmail);
            msg.setFrom(emailFrom);
            msg.setSubject("Recuperación de contraseña — Horizonte Inmobiliario");
            msg.setText("Tu código de recuperación es: " + code + "\n\n"
                    + "Válido por 15 minutos.\n\n"
                    + "Si no solicitaste esto, ignora este mensaje.");
            mailSender.send(msg);
            log.info("Email de recuperación enviado a {}", adminEmail);
        } catch (Exception e) {
            log.error("Error al enviar email de recuperación: {}", e.getMessage());
            log.warn("Código de recuperación (fallback): {}", code);
        }
    }

    // ── Helpers ─────────────────────────────────────────────────────────

    private String generateToken() {
        try {
            SecureRandom sr = new SecureRandom();
            byte[] bytes = new byte[32];
            sr.nextBytes(bytes);
            return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    private static class AttemptInfo {
        int count;
        long firstAttempt;
        long blockedUntil;

        AttemptInfo(int count, long firstAttempt, long blockedUntil) {
            this.count = count;
            this.firstAttempt = firstAttempt;
            this.blockedUntil = blockedUntil;
        }
    }

    private static class ResetInfo {
        String code;
        long createdAt;

        ResetInfo(String code, long createdAt) {
            this.code = code;
            this.createdAt = createdAt;
        }
    }
}
