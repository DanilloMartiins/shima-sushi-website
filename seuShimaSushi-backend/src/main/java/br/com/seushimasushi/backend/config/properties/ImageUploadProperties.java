package br.com.seushimasushi.backend.config.properties;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;

import java.util.List;

@Getter
@Setter
@ConfigurationProperties(prefix = "app.image-upload")
public class ImageUploadProperties {

    @NotBlank(message = "Diretorio base de upload e obrigatorio")
    private String baseDirectory = "uploads/products";

    @Min(value = 1, message = "Tamanho maximo deve ser maior que 0")
    private long maxFileSize = 5242880; // 5MB in bytes

    private List<String> allowedExtensions = List.of("jpg", "jpeg", "png");
}
