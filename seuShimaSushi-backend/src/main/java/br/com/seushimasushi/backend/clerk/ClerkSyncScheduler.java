package br.com.seushimasushi.backend.clerk;

import br.com.seushimasushi.backend.user.model.User;
import br.com.seushimasushi.backend.user.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Component
public class ClerkSyncScheduler {

    private static final Logger log = LoggerFactory.getLogger(ClerkSyncScheduler.class);

    private final ClerkApiClient clerkApiClient;
    private final UserRepository userRepository;

    public ClerkSyncScheduler(ClerkApiClient clerkApiClient, UserRepository userRepository) {
        this.clerkApiClient = clerkApiClient;
        this.userRepository = userRepository;
    }

    @Scheduled(cron = "0 0 5 * * *")
    @Transactional
    public void syncClerkUsers() {
        log.info("Iniciando sync diario com Clerk...");

        List<ClerkApiClient.ClerkUserData> clerkUsers = clerkApiClient.listarUsuarios();

        if (clerkUsers.isEmpty()) {
            log.warn("Nenhum usuario retornado do Clerk (secret key configurada?)");
            return;
        }

        int criados = 0;
        int atualizados = 0;

        for (ClerkApiClient.ClerkUserData clerkUser : clerkUsers) {
            Optional<User> existente = userRepository.findByClerkId(clerkUser.clerkId());

            if (existente.isPresent()) {
                User user = existente.get();
                boolean alterou = false;

                if (!clerkUser.fullName().equals(user.getFullName())) {
                    user.setFullName(clerkUser.fullName());
                    alterou = true;
                }

                if (!clerkUser.email().isBlank() && !clerkUser.email().equals(user.getEmail())) {
                    user.setEmail(clerkUser.email());
                    alterou = true;
                }

                if (alterou) {
                    userRepository.save(user);
                    atualizados++;
                }
            } else {
                User novo = new User();
                novo.setClerkId(clerkUser.clerkId());
                novo.setFullName(clerkUser.fullName());
                novo.setEmail(clerkUser.email());
                novo.setPasswordHash("$2a$12$clerk.sync.placeholder.xxxxxxxxxxxxxxx");
                novo.setRole("CUSTOMER");
                novo.setActive(true);
                userRepository.save(novo);
                criados++;
            }
        }

        log.info("Sync com Clerk finalizado: {} criados, {} atualizados de {} usuarios",
                criados, atualizados, clerkUsers.size());
    }
}
