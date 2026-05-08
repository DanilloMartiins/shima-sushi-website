package br.com.seushimasushi.backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;

@SpringBootApplication
@ConfigurationPropertiesScan
public class SeuShimaSushiBackendApplication {

    public static void main(String[] args) {
        SpringApplication.run(SeuShimaSushiBackendApplication.class, args);
    }
}