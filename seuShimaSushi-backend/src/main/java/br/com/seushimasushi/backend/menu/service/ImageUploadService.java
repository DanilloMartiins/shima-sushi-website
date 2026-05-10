package br.com.seushimasushi.backend.menu.service;

import br.com.seushimasushi.backend.common.exception.FileUploadException;
import br.com.seushimasushi.backend.config.properties.AppProperties;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class ImageUploadService {

    private final AppProperties appProperties;

    public String uploadProductImage(MultipartFile file, Long productId) {
        validateFile(file);

        String filename = generateSecureFilename(file.getOriginalFilename(), productId);
        Path uploadDir = getUploadDirectory();

        try {
            Files.createDirectories(uploadDir);
            Path filePath = uploadDir.resolve(filename);

            Files.write(filePath, file.getBytes());
            log.info("Arquivo de produto salvo com sucesso. ProductId: {}, Filename: {}", productId, filename);

            return filename;
        } catch (IOException e) {
            log.error("Erro ao salvar arquivo de imagem para productId: {}", productId, e);
            throw new FileUploadException("Erro ao processar arquivo de imagem", e);
        }
    }

    public Path getUploadDirectory() {
        return Paths.get(appProperties.getImageUpload().getBaseDirectory()).toAbsolutePath();
    }

    public Path getImagePath(String filename) {
        return getUploadDirectory().resolve(filename);
    }

    private void validateFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new FileUploadException("Arquivo nao pode estar vazio");
        }

        String originalFilename = file.getOriginalFilename();
        validateOriginalFilename(originalFilename);

        long maxSize = appProperties.getImageUpload().getMaxFileSize();
        if (file.getSize() > maxSize) {
            throw new FileUploadException(
                    String.format("Tamanho do arquivo excede o limite permitido de %.2f MB",
                            maxSize / (1024.0 * 1024.0))
            );
        }

        validateExecutableHeader(file);

        String extension = getFileExtension(originalFilename).toLowerCase();
        if (!appProperties.getImageUpload().getAllowedExtensions().contains(extension)) {
            throw new FileUploadException(
                    String.format("Formato de arquivo nao permitido. Extensoes aceitas: %s",
                            String.join(", ", appProperties.getImageUpload().getAllowedExtensions()))
            );
        }
    }

    private void validateOriginalFilename(String originalFilename) {
        if (originalFilename == null || originalFilename.isBlank()) {
            throw new FileUploadException("Nome do arquivo invalido");
        }

        if (originalFilename.contains("..")
                || originalFilename.contains("/")
                || originalFilename.contains("\\")) {
            throw new FileUploadException("Nome de arquivo invalido");
        }
    }

    private void validateExecutableHeader(MultipartFile file) {
        try {
            byte[] content = file.getBytes();
            if (content.length >= 2 && content[0] == 'M' && content[1] == 'Z') {
                throw new FileUploadException("Conteudo de arquivo invalido para imagem");
            }
        } catch (IOException e) {
            throw new FileUploadException("Erro ao validar conteudo do arquivo", e);
        }
    }

    private String generateSecureFilename(String originalFilename, Long productId) {
        String extension = getFileExtension(originalFilename);
        long timestamp = System.currentTimeMillis();
        String uuid = UUID.randomUUID().toString();

        return String.format("%d-%d-%s.%s", productId, timestamp, uuid, extension);
    }

    private String getFileExtension(String filename) {
        if (filename == null || !filename.contains(".")) {
            return "";
        }
        return filename.substring(filename.lastIndexOf(".") + 1);
    }
}
