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
    private static final String[] PERMITTED_URL_PREFIXES = {
        "https://delivery.yooga.app/",
        "https://cdn-production.yooga.com.br/"
    };

    public ImagemProxyService(RestTemplateBuilder builder) {
        this.restTemplate = builder
                .setConnectTimeout(Duration.ofSeconds(5))
                .setReadTimeout(Duration.ofSeconds(5))
                .build();
    }

    public byte[] baixarImagem(String url) {
        // Validação de segurança para múltiplos domínios permitidos
        boolean isAllowed = false;
        for (String prefix : PERMITTED_URL_PREFIXES) {
            if (url != null && url.startsWith(prefix)) {
                isAllowed = true;
                break;
            }
        }

        if (!isAllowed) {
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
