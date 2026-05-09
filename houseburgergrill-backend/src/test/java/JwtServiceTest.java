package br.com.seushimasushi.backend.security.service;

import br.com.seushimasushi.backend.config.properties.AppProperties;
import br.com.seushimasushi.backend.security.service.JwtService;
import br.com.seushimasushi.backend.user.model.Role;
import br.com.seushimasushi.backend.user.model.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.Nested;
import org.springframework.security.core.userdetails.UserDetails;

import java.time.Duration;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class JwtServiceTest {

    private JwtService jwtService;
    private AppProperties appProperties;
    private User usuarioTeste;

    @BeforeEach
    void setup() {
        appProperties = new AppProperties();
        appProperties.getSecurity().getJwt().setSecret("test-secret-key-with-minimum-32-chars-length");
        appProperties.getSecurity().getJwt().setAccessTokenExpiration(Duration.ofMinutes(15));
        
        jwtService = new JwtService(appProperties);
        
        usuarioTeste = new User("Usuário Teste", "teste@example.com", "hashed", Role.CUSTOMER);
        usuarioTeste.setId(1L);
    }

    @Nested
    @DisplayName("Geração de Tokens")
    class GeracaoTokens {

        @Test
        @DisplayName("Deve gerar token de acesso válido")
        void deveGerarTokenValido() {
            var token = jwtService.generateAccessToken(usuarioTeste);
            
            assertNotNull(token, "Token não deveria ser null");
            assertFalse(token.isEmpty(), "Token não deveria ser vazio");
            assertEquals(usuarioTeste.getEmail(), jwtService.extractUsername(token),
                "Email extraído deveria ser o do usuário");
        }

        @Test
        @DisplayName("Token deve ter 3 partes separadas por ponto")
        void tokenDeveTerFormatoCorreto() {
            var token = jwtService.generateAccessToken(usuarioTeste);
            var partes = token.split("\\.");
            
            assertEquals(3, partes.length, "Token JWT deve ter 3 partes");
        }
    }

    @Nested
    @DisplayName("Extração de Informações")
    class ExtrairInfo {

        @Test
        @DisplayName("Deve extrair email do token")
        void deveExtrairEmailDoToken() {
            var token = jwtService.generateAccessToken(usuarioTeste);
            
            var username = jwtService.extractUsername(token);
            
            assertEquals("teste@example.com", username, "Email extraído está errado");
        }
    }

    @Nested
    @DisplayName("Validação de Tokens")
    class ValidarTokens {

        @Test
        @DisplayName("Deve validar token com email correto")
        void deveValidarTokenComEmailCorreto() {
            var token = jwtService.generateAccessToken(usuarioTeste);
            
            var userDetails = mock(UserDetails.class);
            when(userDetails.getUsername()).thenReturn(usuarioTeste.getEmail());
            
            var isValid = jwtService.isTokenValid(token, userDetails);
            
            assertTrue(isValid, "Token deveria ser válido");
        }

        @Test
        @DisplayName("Deve rejeitar token com email errado")
        void deveRejetarTokenComEmailErrado() {
            var token = jwtService.generateAccessToken(usuarioTeste);
            
            var userDetails = mock(UserDetails.class);
            when(userDetails.getUsername()).thenReturn("outroemail@example.com");
            
            var isValid = jwtService.isTokenValid(token, userDetails);
            
            assertFalse(isValid, "Token com email diferente não deveria ser válido");
        }

        @Test
        @DisplayName("Deve detectar token malformado")
        void deveDetectarTokenMalformado() {
            var tokenMalformado = "invalid.token.here";
            
            var isMalformed = jwtService.isMalformed(tokenMalformado);
            
            assertTrue(isMalformed, "Deveria detectar token malformado");
        }

        @Test
        @DisplayName("Deve rejeitar token expirado")
        void deveRejetarTokenExpirado() throws InterruptedException {
            appProperties.getSecurity().getJwt().setAccessTokenExpiration(Duration.ofMillis(100));
            jwtService = new JwtService(appProperties);
            
            var token = jwtService.generateAccessToken(usuarioTeste);
            Thread.sleep(150);
            
            var isExpired = jwtService.isTokenExpired(token);
            
            assertTrue(isExpired, "Token deveria estar expirado");
        }

        @Test
        @DisplayName("Deve rejeitar token vazio")
        void deveRejetarTokenVazio() {
            var isValid = jwtService.isTokenValid("", mock(UserDetails.class));
            
            assertFalse(isValid, "Token vazio não deveria ser válido");
        }
    }

    @Nested
    @DisplayName("Segurança do Token")
    class SegurancaToken {

        @Test
        @DisplayName("Deve gerar tokens diferentes para mesma requisição")
        void deveGerarTokensDiferentes() {
            var token1 = jwtService.generateAccessToken(usuarioTeste);
            var token2 = jwtService.generateAccessToken(usuarioTeste);
            
            assertNotEquals(token1, token2, "Tokens diferentes deveriam ter valores distintos");
        }

        @Test
        @DisplayName("Deve validar token sem lançar exceção para token válido")
        void deveValidarSemErro() {
            var token = jwtService.generateAccessToken(usuarioTeste);
            var userDetails = mock(UserDetails.class);
            when(userDetails.getUsername()).thenReturn(usuarioTeste.getEmail());
            
            // Não deveria lançar exceção
            assertDoesNotThrow(() -> jwtService.isTokenValid(token, userDetails),
                "Deveria validar token sem erros");
        }

        @Test
        @DisplayName("Token não expirado não deveria ser marcado como expirado")
        void tokenNaoExpiradoNaoDeveSeroMarcadoExpirado() {
            appProperties.getSecurity().getJwt().setAccessTokenExpiration(Duration.ofHours(1));
            jwtService = new JwtService(appProperties);
            
            var token = jwtService.generateAccessToken(usuarioTeste);
            
            assertFalse(jwtService.isTokenExpired(token),
                "Token com 1 hora de validade não deveria estar expirado");
        }
    }
}
