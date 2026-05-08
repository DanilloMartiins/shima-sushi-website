package br.com.seushimasushi.backend.menu.controller;

import br.com.seushimasushi.backend.menu.service.ImageUploadService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.nio.file.Files;
import java.nio.file.Path;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/images")
public class ImageController {

    private final ImageUploadService imageUploadService;

    @GetMapping("/products/{filename}")
    public ResponseEntity<byte[]> getProductImage(@PathVariable String filename) {
        try {
            Path imagePath = imageUploadService.getImagePath(filename);

            if (!Files.exists(imagePath)) {
                log.warn("Imagem nao encontrada: {}", filename);
                return ResponseEntity.notFound().build();
            }

            byte[] imageContent = Files.readAllBytes(imagePath);
            String contentType = getContentType(filename);

            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(contentType))
                    .body(imageContent);

        } catch (Exception e) {
            log.error("Erro ao recuperar imagem: {}", filename, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    private String getContentType(String filename) {
        String extension = filename.substring(filename.lastIndexOf(".") + 1).toLowerCase();

        return switch (extension) {
            case "jpg", "jpeg" -> "image/jpeg";
            case "png" -> "image/png";
            default -> "application/octet-stream";
        };
    }
}
