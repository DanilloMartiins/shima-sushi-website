package br.com.seushimasushi.backend.menu.service;

import br.com.seushimasushi.backend.common.exception.FileUploadException;
import br.com.seushimasushi.backend.config.properties.AppProperties;
import br.com.seushimasushi.backend.menu.service.ImageUploadService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import org.springframework.mock.web.MockMultipartFile;

import java.nio.file.Path;

import static org.junit.jupiter.api.Assertions.*;

class ImageUploadServiceTest {

    private ImageUploadService imageUploadService;

    @TempDir
    Path tempDir;

    @BeforeEach
    void setup() {
        var appProps = new AppProperties();
        appProps.getImageUpload().setBaseDirectory(tempDir.toString());
        appProps.getImageUpload().setMaxFileSize(5242880L); // 5MB

        imageUploadService = new ImageUploadService(appProps);
    }

    @Nested
    @DisplayName("Upload de Imagens - Casos Válidos")
    class UploadValidos {

        @Test
        @DisplayName("Deve fazer upload de imagem PNG")
        void deveUploadarPNG() throws Exception {
            var arquivo = new MockMultipartFile(
                    "file",
                    "burger.png",
                    "image/png",
                    "arquivo png simulado".getBytes()
            );

            var resultado = imageUploadService.uploadProductImage(arquivo, 1L);

            assertNotNull(resultado, "Resultado não deveria ser null");
            assertTrue(resultado.contains("png"), "Deveria conter extensão png");
            assertTrue(resultado.contains("1-"), "Deveria conter ID do produto");
        }

        @Test
        @DisplayName("Deve fazer upload de imagem JPG")
        void deveUploadarJPG() throws Exception {
            var arquivo = new MockMultipartFile(
                    "file",
                    "burger.jpg",
                    "image/jpeg",
                    "arquivo jpg simulado".getBytes()
            );

            var resultado = imageUploadService.uploadProductImage(arquivo, 1L);

            assertNotNull(resultado, "Resultado não deveria ser null");
            assertTrue(resultado.contains("jpg"), "Deveria conter extensão jpg");
        }

        @Test
        @DisplayName("Deve fazer upload de imagem JPEG")
        void deveUploadarJPEG() throws Exception {
            var arquivo = new MockMultipartFile(
                    "file",
                    "burger.jpeg",
                    "image/jpeg",
                    "arquivo jpeg simulado".getBytes()
            );

            var resultado = imageUploadService.uploadProductImage(arquivo, 1L);

            assertNotNull(resultado, "Resultado não deveria ser null");
            assertTrue(resultado.contains("jpeg"), "Deveria conter extensão jpeg");
        }

        @Test
        @DisplayName("Nome da imagem deve ser seguro e único")
        void nomeDeveSerSeguroUniquement() throws Exception {
            var arquivo1 = new MockMultipartFile(
                    "file",
                    "burger.png",
                    "image/png",
                    "arquivo 1".getBytes()
            );

            var arquivo2 = new MockMultipartFile(
                    "file",
                    "burger.png",
                    "image/png",
                    "arquivo 2".getBytes()
            );

            var nome1 = imageUploadService.uploadProductImage(arquivo1, 1L);
            var nome2 = imageUploadService.uploadProductImage(arquivo2, 1L);

            assertNotEquals(nome1, nome2, "Nomes deveriam ser diferentes para arquivos diferentes");
        }
    }

    @Nested
    @DisplayName("Upload de Imagens - Validação de Tipo")
    class ValidacaoTipo {

        @Test
        @DisplayName("Deve rejeitar arquivo GIF")
        void deveRejetarGIF() {
            var arquivo = new MockMultipartFile(
                    "file",
                    "burger.gif",
                    "image/gif",
                    "arquivo gif".getBytes()
            );

            assertThrows(FileUploadException.class,
                    () -> imageUploadService.uploadProductImage(arquivo, 1L),
                    "Deveria rejeitar arquivo GIF");
        }

        @Test
        @DisplayName("Deve rejeitar arquivo BMP")
        void deveRejetarBMP() {
            var arquivo = new MockMultipartFile(
                    "file",
                    "burger.bmp",
                    "image/bmp",
                    "arquivo bmp".getBytes()
            );

            assertThrows(FileUploadException.class,
                    () -> imageUploadService.uploadProductImage(arquivo, 1L),
                    "Deveria rejeitar arquivo BMP");
        }

        @Test
        @DisplayName("Deve rejeitar arquivo executável disfarçado de imagem")
        void deveRejetarExecutavelDisfarçado() {
            var arquivo = new MockMultipartFile(
                    "file",
                    "malware.png",
                    "image/png",
                    "MZ\u0090\u0000\u0003".getBytes() // Header de executável
            );

            assertThrows(FileUploadException.class,
                    () -> imageUploadService.uploadProductImage(arquivo, 1L),
                    "Deveria rejeitar arquivo executável disfarçado");
        }
    }

    @Nested
    @DisplayName("Upload de Imagens - Validação de Tamanho")
    class ValidacaoTamanho {

        @Test
        @DisplayName("Deve rejeitar arquivo maior que 5MB")
        void deveRejetarArquivoGrande() {
            var dadosGrandes = new byte[6 * 1024 * 1024]; // 6MB
            var arquivo = new MockMultipartFile(
                    "file",
                    "grande.jpg",
                    "image/jpeg",
                    dadosGrandes
            );

            assertThrows(FileUploadException.class,
                    () -> imageUploadService.uploadProductImage(arquivo, 1L),
                    "Deveria rejeitar arquivo > 5MB");
        }

        @Test
        @DisplayName("Deve aceitar arquivo pequeno")
        void deveAceitarArquivoPequeno() throws Exception {
            var arquivo = new MockMultipartFile(
                    "file",
                    "pequeno.jpg",
                    "image/jpeg",
                    "arquivo pequeno".getBytes()
            );

            var resultado = imageUploadService.uploadProductImage(arquivo, 1L);

            assertNotNull(resultado, "Deveria aceitar arquivo pequeno");
        }

        @Test
        @DisplayName("Deve aceitar arquivo próximo do limite de 5MB")
        void deveAceitarArquivoNoLimite() throws Exception {
            var dados = new byte[5 * 1024 * 1024]; // Exatamente 5MB
            var arquivo = new MockMultipartFile(
                    "file",
                    "limite.jpg",
                    "image/jpeg",
                    dados
            );

            var resultado = imageUploadService.uploadProductImage(arquivo, 1L);

            assertNotNull(resultado, "Deveria aceitar arquivo no limite de 5MB");
        }
    }

    @Nested
    @DisplayName("Segurança - Path Traversal")
    class SecurityPathTraversal {

        @Test
        @DisplayName("Deve rejeitar nome de arquivo com ..")
        void deveRejetarPathTraversal() {
            var arquivo = new MockMultipartFile(
                    "file",
                    "../../malicioso.jpg",
                    "image/jpeg",
                    "conteúdo".getBytes()
            );

            assertThrows(FileUploadException.class,
                    () -> imageUploadService.uploadProductImage(arquivo, 1L),
                    "Deveria rejeitar path traversal");
        }

        @Test
        @DisplayName("Deve rejeitar null em nome do arquivo")
        void deveRejetarNomeNull() {
            var arquivo = new MockMultipartFile(
                    "file",
                    (String) null,
                    "image/jpeg",
                    "conteúdo".getBytes()
            );

            assertThrows(FileUploadException.class,
                    () -> imageUploadService.uploadProductImage(arquivo, 1L),
                    "Deveria rejeitar nome null");
        }

        @Test
        @DisplayName("Deve rejeitar arquivo vazio")
        void deveRejetarArquivoVazio() {
            var arquivo = new MockMultipartFile(
                    "file",
                    "vazio.jpg",
                    "image/jpeg",
                    new byte[0] // Arquivo vazio
            );

            assertThrows(FileUploadException.class,
                    () -> imageUploadService.uploadProductImage(arquivo, 1L),
                    "Deveria rejeitar arquivo vazio");
        }
    }

    @Nested
    @DisplayName("Casos Especiais")
    class CasosEspeciais {

        @Test
        @DisplayName("Deve gerar filename com padrão correto")
        void deveGerarTimestampUnico() throws Exception {
            var arquivo = new MockMultipartFile(
                    "file",
                    "burger.jpg",
                    "image/jpeg",
                    "conteúdo".getBytes()
            );

            var resultado = imageUploadService.uploadProductImage(arquivo, 1L);

            assertNotNull(resultado, "Deveria retornar URL da imagem");
            assertFalse(resultado.isEmpty(), "Filename não deveria ser vazio");
            // Verificar padrão: {productId}-{timestamp}-{uuid}.{ext}
            assertTrue(resultado.matches(".*1-\\d+-[a-f0-9-]+\\.jpg"),
                    "Filename deveria seguir padrão de segurança");
        }
    }
}
