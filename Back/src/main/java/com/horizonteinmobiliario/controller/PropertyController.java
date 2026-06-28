package com.horizonteinmobiliario.controller;

import com.horizonteinmobiliario.model.Property;
import com.horizonteinmobiliario.service.PropertyService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/properties")
public class PropertyController {

    private final PropertyService service;

    public PropertyController(PropertyService service) {
        this.service = service;
    }

    @GetMapping
    public List<Property> getAll(
            @RequestParam(required = false) String operation,
            @RequestParam(required = false) String type) {
        if (operation != null && type != null) {
            return service.findByOperation(operation).stream()
                    .filter(p -> p.getType().equalsIgnoreCase(type))
                    .toList();
        }
        if (operation != null) return service.findByOperation(operation);
        return service.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Property> getById(@PathVariable Long id) {
        return service.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/featured")
    public List<Property> getFeatured() {
        return service.findByFeatured();
    }
}
