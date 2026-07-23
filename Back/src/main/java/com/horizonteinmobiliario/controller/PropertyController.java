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
        List<Property> result;
        if (operation != null && type != null) {
            result = service.findByOperation(operation).stream()
                    .filter(p -> p.getType().equalsIgnoreCase(type))
                    .toList();
        } else if (operation != null) {
            result = service.findByOperation(operation);
        } else {
            result = service.findAll();
        }
        return result;
    }

    @GetMapping("/{id}")
    public ResponseEntity<Property> getById(@PathVariable Long id) {
        return service.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/by-code/{code}")
    public ResponseEntity<Property> getByCode(@PathVariable String code) {
        var result = service.findByCode(code);
        if (result.isEmpty() && code.matches("\\d+")) {
            result = service.findById(Long.parseLong(code));
        }
        return result.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/featured")
    public List<Property> getFeatured() {
        return service.findByFeatured();
    }
}
