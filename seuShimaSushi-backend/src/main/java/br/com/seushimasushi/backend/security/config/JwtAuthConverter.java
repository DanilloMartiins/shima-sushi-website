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
            Optional<User> userOpt = userRepository.findByClerkId(clerkId);

            if (userOpt.isPresent()) {
                User user = userOpt.get();

                if ("ADMIN".equals(user.getRole())) {
                    authorities.add(new SimpleGrantedAuthority("ROLE_ADMIN"));
                }
            }
        }

        return new JwtAuthenticationToken(jwt, authorities);
    }
}
