package br.com.seushimasushi.backend.scraper.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "scraped_products")
public class Produto {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nome;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal preco;

    @Column(name = "url_imagem", length = 1000)
    private String urlImagem;

    @Column(name = "data_atualizacao", nullable = false)
    private LocalDateTime dataAtualizacao;

    // Construtor pra facilitar a criação dos produtos que a gente raspa do site
    public Produto(String nome, BigDecimal preco, String urlImagem) {
        this.nome = nome;
        this.preco = preco;
        this.urlImagem = urlImagem;
        this.dataAtualizacao = LocalDateTime.now();
    }
}
