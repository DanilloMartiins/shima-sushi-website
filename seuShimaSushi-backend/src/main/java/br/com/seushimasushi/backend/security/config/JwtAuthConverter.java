package br.com.seushimasushi.backend.security.config;

import br.com.seushimasushi.backend.clerk.ClerkApiClient;
import br.com.seushimasushi.backend.user.model.User;
import br.com.seushimasushi.backend.user.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
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

    private static final Logger log = LoggerFactory.getLogger(JwtAuthConverter.class);

    private final UserRepository userRepository;
    private final ClerkApiClient clerkApiClient;

    @Autowired
    public JwtAuthConverter(UserRepository userRepository, ClerkApiClient clerkApiClient) {
        this.userRepository = userRepository;
        this.clerkApiClient = clerkApiClient;
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
     * Busca usuario pelo clerk_id. Se encontrar, sincroniza nome/email com os dados do Clerk.
     * Se nao existir, tenta pelo email do JWT.
     * Se ainda nao existir, procura um admin sem clerkId (criado por migration) e vincula.
     * Por ultimo, cria um novo registro automaticamente.
     */
    private User buscarOuCriarUsuario(Jwt jwt, String clerkId) {
        String email = jwt.getClaimAsString("email");
        String nome = jwt.getClaimAsString("name");

        // 1. Busca pelo clerkId — se achar, sincroniza os dados
        Optional<User> userOpt = userRepository.findByClerkId(clerkId);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            sincronizarDados(user, nome, email);
            return user;
        }

        // 2. Tenta vincular pelo email do JWT
        if (email != null && !email.isBlank()) {
            Optional<User> userByEmail = userRepository.findByEmail(email);
            if (userByEmail.isPresent()) {
                User user = userByEmail.get();
                user.setClerkId(clerkId);
                sincronizarDados(user, nome, email);
                log.info("Usuario vinculado ao Clerk: email={}, clerkId={}", email, clerkId);
                return userRepository.save(user);
            }
        }

        // 3. Procura admin orfao (criado por migration sem clerkId) e vincula
        List<String> adminRoles = List.of("ADMIN", "SUPER_ADMIN");
        Optional<User> adminOrfao = userRepository.findFirstByClerkIdIsNullAndRoleIn(adminRoles);
        if (adminOrfao.isPresent()) {
            User user = adminOrfao.get();
            user.setClerkId(clerkId);
            sincronizarDados(user, nome, email);
            log.info("Admin orfao vinculado ao Clerk: id={}, clerkId={}, email={}", user.getId(), clerkId, email);
            return userRepository.save(user);
        }

        // 4. Busca dados reais no Clerk antes de criar
        String nomeReal = nome;
        String emailReal = email;

        if (nomeReal == null || nomeReal.isBlank()) {
            ClerkApiClient.ClerkUserData dadosClerk = clerkApiClient.buscarPorId(clerkId);
            if (dadosClerk != null) {
                nomeReal = dadosClerk.fullName();
                if (emailReal == null || emailReal.isBlank()) {
                    emailReal = dadosClerk.email();
                }
            }
        }

        User novo = new User();
        novo.setClerkId(clerkId);
        novo.setEmail(emailReal != null ? emailReal : "");
        novo.setFullName(nomeReal != null ? nomeReal : clerkId);
        novo.setPasswordHash("$2a$12$clerk.auth.placeholder.xxxxxxxxxxxxxxx");
        novo.setRole("CUSTOMER");
        novo.setActive(true);
        log.info("Novo usuario criado via Clerk: clerkId={}, email={}", clerkId, emailReal);
        return userRepository.save(novo);
    }

    /*
     * Atualiza nome e email do usuario com os dados mais recentes do Clerk
     */
    private void sincronizarDados(User user, String nome, String email) {
        boolean alterou = false;

        if (nome != null && !nome.isBlank() && !nome.equals(user.getFullName())) {
            user.setFullName(nome);
            alterou = true;
        }

        if (email != null && !email.isBlank() && !email.equals(user.getEmail())) {
            user.setEmail(email);
            alterou = true;
        }

        if (alterou) {
            userRepository.save(user);
            log.info("Dados do usuario sincronizados com Clerk: id={}", user.getId());
        }
    }
}
