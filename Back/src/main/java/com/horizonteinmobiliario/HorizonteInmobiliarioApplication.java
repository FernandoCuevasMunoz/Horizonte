package com.horizonteinmobiliario;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class HorizonteInmobiliarioApplication {
    public static void main(String[] args) {
        SpringApplication.run(HorizonteInmobiliarioApplication.class, args);
    }
}
