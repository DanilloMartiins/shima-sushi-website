package br.com.seushimasushi.backend.auth.service;

import br.com.seushimasushi.backend.auth.dto.AuthResponse;
import br.com.seushimasushi.backend.auth.dto.LoginRequest;
import br.com.seushimasushi.backend.auth.dto.LogoutRequest;
import br.com.seushimasushi.backend.auth.dto.RefreshTokenRequest;
import br.com.seushimasushi.backend.auth.dto.RegisterRequest;
import br.com.seushimasushi.backend.auth.model.RefreshToken;
import br.com.seushimasushi.backend.common.exception.BadRequestException;
import br.com.seushimasushi.backend.common.exception.ConflictException;
import br.com.seushimasushi.backend.common.exception.UnauthorizedException;
import br.com.seushimasushi.backend.security.service.JwtService;
import br.com.seushimasushi.backend.user.model.Role;
import br.com.seushimasushi.backend.user.model.User;
import br.com.seushimasushi.backend.user.repository.UserRepository;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validator;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final RefreshTokenService refreshTokenService;
    private final Validator validator;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        // Primeiro de tudo, valida se os campos estão vindo certos
        validateRequest(request);
        validatePasswordComplexity(request);

        // Deixo o e-mail em minúsculo e sem espaços pra não dar erro se a pessoa digitar diferente depois
        String normalizedEmail = normalizeEmail(request.email());
        
        // Verifico se o e-mail já existe pra não duplicar no banco
        if (userRepository.existsByEmailIgnoreCase(normalizedEmail)) {
            throw new ConflictException("E-mail já cadastrado");
        }

        // Crio o novo usuário. A senha tem que ser criptografada aqui, senão fica exposta no banco!
        User user = new User(
                request.fullName().trim(),
                normalizedEmail,
                passwordEncoder.encode(request.password()), 
                Role.CUSTOMER
        );

        User savedUser = userRepository.save(user);
        
        // Já gera o token pra pessoa já entrar logado
        return issueTokens(savedUser);
    }

    private void validatePasswordComplexity(RegisterRequest request) {
        String fullName = request.fullName().toLowerCase();
        String password = request.password().toLowerCase();

        // Verifica se a senha contém partes do nome (mínimo 3 caracteres para evitar falsos positivos)
        String[] nameParts = fullName.split("\\s+");
        for (String part : nameParts) {
            if (part.length() >= 3 && password.contains(part)) {
                throw new BadRequestException("A senha não pode conter partes do seu nome");
            }
        }
    }

    @Transactional
    public AuthResponse login(LoginRequest request) {
        String normalizedEmail = normalizeEmail(request.email());
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(normalizedEmail, request.password())
            );
        } catch (BadCredentialsException ex) {
            throw new UnauthorizedException("E-mail ou senha inválidos");
        } catch (AuthenticationException ex) {
            throw new UnauthorizedException("Falha na autenticação");
        }

        User user = userRepository.findByEmailIgnoreCase(normalizedEmail)
                .orElseThrow(() -> new UnauthorizedException("E-mail ou senha inválidos"));

        return issueTokens(user);
    }

    @Transactional
    public AuthResponse refresh(RefreshTokenRequest request) {
        String rawToken = request.refreshToken().trim();
        RefreshToken currentToken = refreshTokenService.validateActiveToken(rawToken);
        User user = currentToken.getUser();

        refreshTokenService.revoke(currentToken);

        return issueTokens(user);
    }

    @Transactional
    public void logout(LogoutRequest request) {
        refreshTokenService.revokeByRawToken(request.refreshToken().trim());
    }

    private AuthResponse issueTokens(User user) {
        String accessToken = jwtService.generateAccessToken(user);
        RefreshTokenService.CreatedRefreshToken refreshToken = refreshTokenService.create(user);

        return new AuthResponse(
                accessToken,
                refreshToken.rawToken(),
                "Bearer",
                jwtService.accessTokenExpiresInSeconds()
        );
    }

    private String normalizeEmail(String email) {
        return email.trim().toLowerCase();
    }

    private <T> void validateRequest(T request) {
        if (request == null) {
            throw new BadRequestException("Dados inválidos");
        }

        var violations = validator.validate(request);
        if (!violations.isEmpty()) {
            ConstraintViolation<T> violation = violations.iterator().next();
            throw new BadRequestException(violation.getMessage());
        }
    }
}
