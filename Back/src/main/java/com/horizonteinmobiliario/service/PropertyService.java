package com.horizonteinmobiliario.service;

import com.horizonteinmobiliario.model.Property;
import com.horizonteinmobiliario.repository.PropertyRepository;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.List;
import java.util.Optional;

@Service
public class PropertyService {

    private final PropertyRepository repo;

    public PropertyService(PropertyRepository repo) {
        this.repo = repo;
    }

    public List<Property> findAll() {
        return sortAvailableFirst(repo.findAll());
    }

    public Optional<Property> findById(Long id) {
        return repo.findById(id);
    }

    public Optional<Property> findByCode(String code) {
        return repo.findByCode(code);
    }

    public List<Property> findByOperation(String operation) {
        return sortAvailableFirst(repo.findByOperation(operation));
    }

    public List<Property> findByFeatured() {
        return sortAvailableFirst(repo.findByFeaturedTrue());
    }

    private List<Property> sortAvailableFirst(List<Property> list) {
        list.sort(Comparator.comparing(p -> p.getStatus() != null ? 1 : 0));
        return list;
    }

    public Property save(Property property) {
        return repo.save(property);
    }

    public void delete(Long id) {
        repo.deleteById(id);
    }
}
