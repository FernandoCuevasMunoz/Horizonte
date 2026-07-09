package com.horizonteinmobiliario.repository;

import com.horizonteinmobiliario.model.MercadoLibreToken;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MercadoLibreTokenRepository extends JpaRepository<MercadoLibreToken, Long> {
    MercadoLibreToken findTopByOrderByExpiresAtDesc();
}
