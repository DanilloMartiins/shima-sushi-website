package br.com.seushimasushi.backend.auth.controller;

import br.com.seushimasushi.backend.auth.dto.AuthResponse;
import br.com.seushimasushi.backend.auth.dto.LoginRequest;
import br.com.seushimasushi.backend.auth.dto.LogoutRequest;
import br.com.seushimasushi.backend.auth.dto.MessageResponse;
import br.com.seushimasushi.backend.auth.dto.RefreshTokenRequest;
import br.com.seushimasushi.backend.auth.dto.RegisterRequest;
import br.com.seushimasushi.backend.auth.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    private final AuthService authService;

    // Construtor para o Spring injetar o serviço de autenticação
    @Autowired
    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    // Endpoint para criar uma nova conta no sistema
    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        // Chamamos o serviço para processar a regra de negócio do cadastro
        AuthResponse response = authService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    // Endpoint para realizar o login e receber os tokens de acesso
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(response);
    }

    // Endpoint usado para renovar o token de acesso quando ele expira
    @PostMapping("/refresh")
    public ResponseEntity<AuthResponse> refresh(@Valid @RequestBody RefreshTokenRequest request) {
        AuthResponse response = authService.refresh(request);
        return ResponseEntity.ok(response);
    }

    // Endpoint para deslogar e invalidar o token atual
    @PostMapping("/logout")
    public ResponseEntity<MessageResponse> logout(@Valid @RequestBody LogoutRequest request) {
        authService.logout(request);
        return ResponseEntity.ok(new MessageResponse("Logout realizado com sucesso"));
    }
}