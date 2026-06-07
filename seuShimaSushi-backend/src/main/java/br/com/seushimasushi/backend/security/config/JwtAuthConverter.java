package br.com.seushimasushi.backend.security.config;

import br.com.seushimasushi.backend.user.model.User;
import br.com.seushimasushi.backend.user.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.convert.converter.Converter;
import org.springframework.security.authentication.AbstractAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Component
public class JwtAuthConverter implements Converter<Jwt, AbstractAuthenticationToken> {

    private final UserRepository userRepository;

    @Autowired
    public JwtAuthConverter(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public AbstractAuthenticationToken convert(Jwt jwt) {
        String clerkId = jwt.getSubject();

        List<SimpleGrantedAuthority> authorities = new ArrayList<>();

        if (clerkId != null) {
            User user = buscarOuCriarUsuario(jwt, clerkId);

            if (user != null && ("ADMIN".equals(user.getRole()) || "SUPER_ADMIN".equals(user.getRole()))) {
                authorities.add(new SimpleGrantedAuthority("ROLE_ADMIN"));
            }
            if (user != null && "SUPER_ADMIN".equals(user.getRole())) {
                authorities.add(new SimpleGrantedAuthority("ROLE_SUPER_ADMIN"));
            }
        }

        return new JwtAuthenticationToken(jwt, authorities);
    }

    /*
     * Busca usuario pelo clerk_id. Se nao existir, tenta pelo email do JWT.
     * Se ainda nao existir, cria um novo registro automaticamente.
     * Isso garante que qualquer pessoa que fizer login vai ter um registro na tabela users.
     */
    private User buscarOuCriarUsuario(Jwt jwt, String clerkId) {
        Optional<User> userOpt = userRepository.findByClerkId(clerkId);
        if (userOpt.isPresent()) {
            return userOpt.get();
        }

        String email = jwt.getClaimAsString("email");
        if (email != null && !email.isBlank()) {
            Optional<User> userByEmail = userRepository.findByEmail(email);
            if (userByEmail.isPresent()) {
                User user = userByEmail.get();
                user.setClerkId(clerkId);
                return userRepository.save(user);
            }
        }

        User novo = new User();
        novo.setClerkId(clerkId);
        novo.setEmail(email != null ? email : "");
        String nome = jwt.getClaimAsString("name");
        novo.setFullName(nome != null ? nome : clerkId);
        novo.setPasswordHash("$2a$12$clerk.auth.placeholder.xxxxxxxxxxxxxxx");
        novo.setRole("CUSTOMER");
        novo.setActive(true);
        return userRepository.save(novo);
    }
}
