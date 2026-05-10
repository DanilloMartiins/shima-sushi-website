package br.com.seushimasushi.backend.scraper.controller;

import br.com.seushimasushi.backend.scraper.model.Produto;
import br.com.seushimasushi.backend.scraper.service.ProdutoScrapedService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/produtos")
public class ScraperController {

    private final ProdutoScrapedService produtoService;

    @Autowired
    public ScraperController(ProdutoScrapedService produtoService) {
        this.produtoService = produtoService;
    }

    // Endpoint público pra retornar o que temos no banco (cache)
    @GetMapping
    public ResponseEntity<List<Produto>> listar() {
        // Puxa do banco, sem acessar o site do Yooga durante a requisição
        List<Produto> produtos = produtoService.listarProdutos();
        return ResponseEntity.ok(produtos);
    }
}
