package com.horizonteinmobiliario.model;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "ml_tokens")
public class MercadoLibreToken {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "access_token", length = 500)
    private String accessToken;

    @Column(name = "refresh_token", length = 500)
    private String refreshToken;

    @Column(name = "expires_at")
    private Instant expiresAt;

    @Column(name = "ml_user_id")
    private Long mlUserId;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getAccessToken() { return accessToken; }
    public void setAccessToken(String accessToken) { this.accessToken = accessToken; }
    public String getRefreshToken() { return refreshToken; }
    public void setRefreshToken(String refreshToken) { this.refreshToken = refreshToken; }
    public Instant getExpiresAt() { return expiresAt; }
    public void setExpiresAt(Instant expiresAt) { this.expiresAt = expiresAt; }
    public Long getMlUserId() { return mlUserId; }
    public void setMlUserId(Long mlUserId) { this.mlUserId = mlUserId; }
}
