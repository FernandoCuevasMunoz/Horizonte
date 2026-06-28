package com.horizonteinmobiliario.repository;

import com.horizonteinmobiliario.model.ContactMessage;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ContactMessageRepository extends JpaRepository<ContactMessage, Long> {
}
