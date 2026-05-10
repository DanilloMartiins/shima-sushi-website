package br.com.seushimasushi.backend.auth.service;

import br.com.seushimasushi.backend.auth.dto.LoginRequest;
import br.com.seushimasushi.backend.auth.dto.RegisterRequest;
import br.com.seushimasushi.backend.auth.repository.RefreshTokenRepository;
import br.com.seushimasushi.backend.auth.service.AuthService;
import br.com.seushimasushi.backend.common.exception.ConflictException;
import br.com.seushimasushi.backend.common.exception.UnauthorizedException;
import br.com.seushimasushi.backend.user.model.Role;
import br.com.seushimasushi.backend.user.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.Nested;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
class AuthServiceTest {

    @Autowired
    private AuthService authService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RefreshTokenRepository refreshTokenRepository;

    @BeforeEach
    void setup() {
        refreshTokenRepository.deleteAll();
        userRepository.deleteAll();
    }

    @Nested
    @DisplayName("Testes de Registro")
    class RegisterTests {

        @Test
        @DisplayName("Deve registrar um novo usuário com sucesso")
        void deveRegistrarNovoUsuario() {
            var request = new RegisterRequest("João Silva", "joao@example.com", "SecurePass@123");
            
            var response = authService.register(request);
            
            assertNotNull(response.accessToken(), "Deveria ter access token");
            assertNotNull(response.refreshToken(), "Deveria ter refresh token");
            assertEquals("Bearer", response.tokenType(), "Deveria ser Bearer");
            
            var usuarioSalvo = userRepository.findByEmailIgnoreCase("joao@example.com");
            assertTrue(usuarioSalvo.isPresent(), "Usuário deveria estar no banco");
            assertEquals(Role.CUSTOMER, usuarioSalvo.get().getRole(), "Deveria ser CUSTOMER");
        }

        @Test
        @DisplayName("Deve rejeitar email duplicado")
        void deveRejetarEmailDuplicado() {
            var request1 = new RegisterRequest("User 1", "email@example.com", "Pass@123456");
            authService.register(request1);
            
            var request2 = new RegisterRequest("User 2", "email@example.com", "Pass@654321");
            
            assertThrows(ConflictException.class, () -> authService.register(request2), 
                "Deveria lançar exceção pra email duplicado");
        }

        @Test
        @DisplayName("Deve rejeitar nome vazio")
        void deveRejetarNomeVazio() {
            var request = new RegisterRequest("", "email@example.com", "Pass@123456");
            
            assertThrows(Exception.class, () -> authService.register(request),
                "Deveria rejeitar nome vazio");
        }

        @Test
        @DisplayName("Deve rejeitar email sem @")
        void deveRejetarEmailInvalido() {
            var request = new RegisterRequest("João", "emailinvalido.com", "Pass@123456");
            
            assertThrows(Exception.class, () -> authService.register(request),
                "Deveria rejeitar email inválido");
        }

        @Test
        @DisplayName("Deve rejeitar senha fraca")
        void deveRejetarSenhaFraca() {
            var request = new RegisterRequest("João", "email@example.com", "abc123");
            
            assertThrows(Exception.class, () -> authService.register(request),
                "Deveria rejeitar senha fraca");
        }
    }

    @Nested
    @DisplayName("Testes de Login")
    class LoginTests {

        @Test
        @DisplayName("Deve fazer login com credenciais válidas")
        void deveLogarComCredenciaisValidas() {
            var registerRequest = new RegisterRequest("Test User", "test@example.com", "ValidPass@123");
            authService.register(registerRequest);
            
            var loginRequest = new LoginRequest("test@example.com", "ValidPass@123");
            var response = authService.login(loginRequest);
            
            assertNotNull(response.accessToken(), "Deveria ter access token");
            assertNotNull(response.refreshToken(), "Deveria ter refresh token");
            assertEquals("Bearer", response.tokenType(), "Deveria ser Bearer");
        }

        @Test
        @DisplayName("Deve rejeitar login com senha errada")
        void deveRejetarSenhaErrada() {
            var registerRequest = new RegisterRequest("Test User", "test@example.com", "CorrectPass@123");
            authService.register(registerRequest);
            
            var loginRequest = new LoginRequest("test@example.com", "WrongPassword@123");
            
            assertThrows(UnauthorizedException.class, () -> authService.login(loginRequest),
                "Deveria rejeitar senha errada");
        }

        @Test
        @DisplayName("Deve rejeitar login com email inexistente")
        void deveRejetarEmailInexistente() {
            var loginRequest = new LoginRequest("naoexiste@example.com", "SomePass@123");
            
            assertThrows(UnauthorizedException.class, () -> authService.login(loginRequest),
                "Deveria rejeitar email que não existe");
        }

        @Test
        @DisplayName("Deve ser case-insensitive para email")
        void deveAceitarEmailComCaseDiferente() {
            var registerRequest = new RegisterRequest("Test User", "TestEmail@example.com", "Pass@123456");
            authService.register(registerRequest);
            
            var loginRequest = new LoginRequest("testemail@example.com", "Pass@123456");
            var response = authService.login(loginRequest);
            
            assertNotNull(response.accessToken(), "Deveria fazer login independente de maiúsculas");
        }

        @Test
        @DisplayName("Deve rejeitar usuário inativo")
        void deveRejetarUsuarioInativo() {
            var registerRequest = new RegisterRequest("Test User", "inactive@example.com", "Pass@123456");
            authService.register(registerRequest);
            
            // Marcar usuário como inativo
            var user = userRepository.findByEmailIgnoreCase("inactive@example.com").get();
            user.setActive(false);
            userRepository.save(user);
            
            var loginRequest = new LoginRequest("inactive@example.com", "Pass@123456");
            
            assertThrows(UnauthorizedException.class, () -> authService.login(loginRequest),
                "Deveria rejeitar usuário inativo");
        }
    }
}
