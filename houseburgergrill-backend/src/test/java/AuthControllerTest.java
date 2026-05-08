package br.com.seushimasushi.backend.auth.controller;

import br.com.seushimasushi.backend.auth.dto.AuthResponse;
import br.com.seushimasushi.backend.auth.dto.LoginRequest;
import br.com.seushimasushi.backend.auth.dto.RegisterRequest;
import br.com.seushimasushi.backend.auth.service.AuthService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private AuthService authService;

    @Nested
    @DisplayName("Endpoints de Registro")
    class RegistroTests {

        @Test
        @DisplayName("POST /auth/register com dados válidos retorna 201")
        void registroComDadosValidos() throws Exception {
            var request = new RegisterRequest("João Silva", "joao@example.com", "SenhaForte@123");

            var response = """
                    {
                      "accessToken": "token123",
                      "refreshToken": "refresh123",
                      "tokenType": "Bearer",
                      "expiresIn": 900
                    }
                    """;

            when(authService.register(any())).thenReturn(
                    new AuthResponse(
                            "token123",
                            "refresh123",
                            "Bearer",
                            900
                    )
            );

            mockMvc.perform(post("/api/v1/auth/register")
                    .contentType("application/json")
                    .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isCreated())
                    .andExpect(jsonPath("$.accessToken").exists())
                    .andExpect(jsonPath("$.refreshToken").exists())
                    .andExpect(jsonPath("$.tokenType").value("Bearer"));
        }

        @Test
        @DisplayName("POST /auth/register com email inválido retorna 400")
        void registroComEmailInvalido() throws Exception {
            mockMvc.perform(post("/api/v1/auth/register")
                    .contentType("application/json")
                    .content("""
                            {
                              "fullName": "João Silva",
                              "email": "email-invalido",
                              "password": "Pass@123456"
                            }
                            """))
                    .andExpect(status().isBadRequest());
        }

        @Test
        @DisplayName("POST /auth/register com senha fraca retorna 400")
        void registroComSenhaFraca() throws Exception {
            mockMvc.perform(post("/api/v1/auth/register")
                    .contentType("application/json")
                    .content("""
                            {
                              "fullName": "João",
                              "email": "joao@example.com",
                              "password": "123"
                            }
                            """))
                    .andExpect(status().isBadRequest());
        }

        @Test
        @DisplayName("POST /auth/register com nome vazio retorna 400")
        void registroComNomeVazio() throws Exception {
            mockMvc.perform(post("/api/v1/auth/register")
                    .contentType("application/json")
                    .content("""
                            {
                              "fullName": "",
                              "email": "joao@example.com",
                              "password": "Pass@123456"
                            }
                            """))
                    .andExpect(status().isBadRequest());
        }

        @Test
        @DisplayName("POST /auth/register com email vazio retorna 400")
        void registroComEmailVazio() throws Exception {
            mockMvc.perform(post("/api/v1/auth/register")
                    .contentType("application/json")
                    .content("""
                            {
                              "fullName": "João Silva",
                              "email": "",
                              "password": "Pass@123456"
                            }
                            """))
                    .andExpect(status().isBadRequest());
        }
    }

    @Nested
    @DisplayName("Endpoints de Login")
    class LoginTests {

        @Test
        @DisplayName("POST /auth/login com credenciais válidas retorna 200")
        void loginComCredenciaisValidas() throws Exception {
            var request = new LoginRequest("joao@example.com", "Pass@123456");

            when(authService.login(any())).thenReturn(
                    new AuthResponse(
                            "token123",
                            "refresh123",
                            "Bearer",
                            900
                    )
            );

            mockMvc.perform(post("/api/v1/auth/login")
                    .contentType("application/json")
                    .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.accessToken").exists());
        }

        @Test
        @DisplayName("POST /auth/login com email inválido retorna 400")
        void loginComEmailInvalido() throws Exception {
            mockMvc.perform(post("/api/v1/auth/login")
                    .contentType("application/json")
                    .content("""
                            {
                              "email": "email-invalido",
                              "password": "Pass@123456"
                            }
                            """))
                    .andExpect(status().isBadRequest());
        }

        @Test
        @DisplayName("POST /auth/login com email vazio retorna 400")
        void loginComEmailVazio() throws Exception {
            mockMvc.perform(post("/api/v1/auth/login")
                    .contentType("application/json")
                    .content("""
                            {
                              "email": "",
                              "password": "Pass@123456"
                            }
                            """))
                    .andExpect(status().isBadRequest());
        }

        @Test
        @DisplayName("POST /auth/login com senha vazia retorna 400")
        void loginComSenhaVazia() throws Exception {
            mockMvc.perform(post("/api/v1/auth/login")
                    .contentType("application/json")
                    .content("""
                            {
                              "email": "joao@example.com",
                              "password": ""
                            }
                            """))
                    .andExpect(status().isBadRequest());
        }

        @Test
        @DisplayName("POST /auth/login com JSON inválido retorna 400")
        void loginComJSONInvalido() throws Exception {
            mockMvc.perform(post("/api/v1/auth/login")
                    .contentType("application/json")
                    .content("{ json inválido }"))
                    .andExpect(status().isBadRequest());
        }
    }

    @Nested
    @DisplayName("Refresh Token")
    class RefreshTokenTests {

        @Test
        @DisplayName("POST /auth/refresh com token válido retorna novo token")
        void refreshComTokenValido() throws Exception {
            mockMvc.perform(post("/api/v1/auth/refresh")
                    .contentType("application/json")
                    .content("""
                            {
                              "refreshToken": "refresh123"
                            }
                            """))
                    .andExpect(status().isOk());
        }
    }

    @Nested
    @DisplayName("Content-Type")
    class ContentTypeTests {

        @Test
        @DisplayName("Request sem Content-Type correto retorna erro")
        void requestSemContentType() throws Exception {
            mockMvc.perform(post("/api/v1/auth/register")
                    .content("""
                            {
                              "fullName": "João",
                              "email": "joao@example.com",
                              "password": "Pass@123456"
                            }
                            """))
                    .andExpect(status().isUnsupportedMediaType());
        }
    }
}
