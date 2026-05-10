package br.com.seushimasushi.backend.scraper.controller;

import br.com.seushimasushi.backend.scraper.service.ImagemProxyService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.CacheControl;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.concurrent.TimeUnit;

@RestController
@RequestMapping("/api/imagem")
public class ImagemProxyController {

    private final ImagemProxyService imagemProxyService;

    @Autowired
    public ImagemProxyController(ImagemProxyService imagemProxyService) {
        this.imagemProxyService = imagemProxyService;
    }

    @GetMapping
    public ResponseEntity<byte[]> proxyImagem(@RequestParam("url") String url) {
        byte[] imagemBytes = imagemProxyService.baixarImagem(url);

        if (imagemBytes == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }

        // Detecta o tipo de imagem pela URL (simplificado)
        MediaType mediaType = url.toLowerCase().contains(".png") 
                ? MediaType.IMAGE_PNG 
                : MediaType.IMAGE_JPEG;

        return ResponseEntity.ok()
                .contentType(mediaType)
                .cacheControl(CacheControl.maxAge(1, TimeUnit.DAYS)) // Cache de 1 dia
                .body(imagemBytes);
    }
}
