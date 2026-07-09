package com.horizonteinmobiliario.model;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "ml_publications")
public class MercadoLibrePublication {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "property_id")
    private Long propertyId;

    @Column(name = "ml_item_id", length = 50)
    private String mlItemId;

    @Column(length = 20)
    private String status;

    @Column(length = 500)
    private String permalink;

    @Column(name = "published_at")
    private Instant publishedAt;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getPropertyId() { return propertyId; }
    public void setPropertyId(Long propertyId) { this.propertyId = propertyId; }
    public String getMlItemId() { return mlItemId; }
    public void setMlItemId(String mlItemId) { this.mlItemId = mlItemId; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getPermalink() { return permalink; }
    public void setPermalink(String permalink) { this.permalink = permalink; }
    public Instant getPublishedAt() { return publishedAt; }
    public void setPublishedAt(Instant publishedAt) { this.publishedAt = publishedAt; }
}
