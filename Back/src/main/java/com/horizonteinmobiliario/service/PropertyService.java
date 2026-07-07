package com.horizonteinmobiliario.service;

import com.horizonteinmobiliario.model.Property;
import com.horizonteinmobiliario.repository.PropertyRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class PropertyService {

    private final PropertyRepository repo;

    public PropertyService(PropertyRepository repo) {
        this.repo = repo;
    }

    public List<Property> findAll() {
        return repo.findAll();
    }

    public Optional<Property> findById(Long id) {
        return repo.findById(id);
    }

    public Optional<Property> findByCode(String code) {
        return repo.findByCode(code);
    }

    public List<Property> findByOperation(String operation) {
        return repo.findByOperation(operation);
    }

    public List<Property> findByFeatured() {
        return repo.findByFeaturedTrue();
    }

    public Property save(Property property) {
        return repo.save(property);
    }

    public void delete(Long id) {
        repo.deleteById(id);
    }
}
