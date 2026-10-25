package com.example.admission;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;

@SpringBootApplication
@EnableDiscoveryClient
public class AdmissionApplication {

    public static void main(String[] args) {
        SpringApplication.run(AdmissionApplication.class, args);
    }
}
