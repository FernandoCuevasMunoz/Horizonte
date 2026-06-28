package com.horizonteinmobiliario.repository;

import com.horizonteinmobiliario.model.AdminSetting;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AdminSettingRepository extends JpaRepository<AdminSetting, String> {
}
