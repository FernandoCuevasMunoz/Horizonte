package com.horizonteinmobiliario.repository;

import com.horizonteinmobiliario.model.Property;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PropertyRepository extends JpaRepository<Property, Long> {
    List<Property> findByOperation(String operation);
    List<Property> findByType(String type);
    List<Property> findByFeaturedTrue();
    List<Property> findByOperationAndType(String operation, String type);
}
