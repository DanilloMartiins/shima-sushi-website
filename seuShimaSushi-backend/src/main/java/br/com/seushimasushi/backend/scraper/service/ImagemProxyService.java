package br.com.seushimasushi.backend.scraper.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.Duration;

@Slf4j
@Service
public class ImagemProxyService {

    private final RestTemplate restTemplate;
    private static final String PERMITTED_URL_PREFIX = "https://delivery.yooga.app/";

    public ImagemProxyService(RestTemplateBuilder builder) {
        // Configura o RestTemplate com timeouts simples (5 segundos)
        this.restTemplate = builder
                .setConnectTimeout(Duration.ofSeconds(5))
                .setReadTimeout(Duration.ofSeconds(5))
                .build();
    }

    public byte[] baixarImagem(String url) {
        // Validação básica de segurança (evitar SSRF)
        if (url == null || !url.startsWith(PERMITTED_URL_PREFIX)) {
            log.warn("Tentativa de acesso a URL não permitida: {}", url);
            throw new IllegalArgumentException("URL de imagem não permitida");
        }

        try {
            log.info("Fazendo proxy da imagem (Sync): {}", url);
            // Faz o download da imagem direto como array de bytes
            ResponseEntity<byte[]> response = restTemplate.getForEntity(url, byte[].class);
            
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                return response.getBody();
            }
        } catch (Exception e) {
            log.error("Erro ao baixar imagem do Yooga: {}", e.getMessage());
        }
        
        return null;
    }
}
