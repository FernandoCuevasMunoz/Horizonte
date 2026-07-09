package com.horizonteinmobiliario.repository;

import com.horizonteinmobiliario.model.MercadoLibrePublication;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MercadoLibrePublicationRepository extends JpaRepository<MercadoLibrePublication, Long> {
    MercadoLibrePublication findByPropertyId(Long propertyId);
    MercadoLibrePublication findByMlItemId(String mlItemId);
}
