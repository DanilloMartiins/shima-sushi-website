package br.com.seushimasushi.backend.clerk;

import br.com.seushimasushi.backend.config.properties.AppProperties;
import com.fasterxml.jackson.databind.JsonNode;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.ArrayList;
import java.util.List;

@Service
public class ClerkApiClient {

    private static final Logger log = LoggerFactory.getLogger(ClerkApiClient.class);
    private static final String CLERK_API_BASE = "https://api.clerk.com/v1";

    private final WebClient webClient;
    private final String secretKey;

    public ClerkApiClient(WebClient.Builder webClientBuilder, AppProperties appProperties) {
        this.secretKey = appProperties.getClerk().getSecretKey();
        this.webClient = webClientBuilder.baseUrl(CLERK_API_BASE).build();
    }

    public ClerkUserData buscarPorId(String clerkId) {
        if (secretKey == null || secretKey.isBlank() || clerkId == null) {
            return null;
        }

        try {
            JsonNode node = webClient.get()
                    .uri("/users/{id}", clerkId)
                    .header("Authorization", "Bearer " + secretKey)
                    .retrieve()
                    .bodyToMono(JsonNode.class)
                    .block();

            if (node == null || !node.has("id")) return null;

            String firstName = node.has("first_name") && !node.get("first_name").isNull()
                    ? node.get("first_name").asText() : "";
            String lastName = node.has("last_name") && !node.get("last_name").isNull()
                    ? node.get("last_name").asText() : "";
            String email = extrairEmail(node);

            String fullName = (firstName + " " + lastName).trim();
            if (fullName.isBlank()) {
                fullName = email;
            }

            return new ClerkUserData(clerkId, fullName, email);
        } catch (Exception e) {
            log.error("Erro ao buscar usuario {} no Clerk: {}", clerkId, e.getMessage());
            return null;
        }
    }

    public List<ClerkUserData> listarUsuarios() {
        List<ClerkUserData> usuarios = new ArrayList<>();

        if (secretKey == null || secretKey.isBlank()) {
            log.warn("CLERK_SECRET_KEY nao configurada — pulando sync do Clerk");
            return usuarios;
        }

        int offset = 0;
        int limit = 100;

        try {
            while (true) {
                JsonNode page = buscarPagina(offset, limit);
                if (page == null || !page.isArray() || page.isEmpty()) {
                    break;
                }

                for (JsonNode node : page) {
                    String id = node.has("id") ? node.get("id").asText() : null;
                    if (id == null) continue;

                    String firstName = node.has("first_name") && !node.get("first_name").isNull()
                            ? node.get("first_name").asText() : "";
                    String lastName = node.has("last_name") && !node.get("last_name").isNull()
                            ? node.get("last_name").asText() : "";
                    String email = extrairEmail(node);

                    String fullName = (firstName + " " + lastName).trim();
                    if (fullName.isBlank()) {
                        fullName = email;
                    }

                    usuarios.add(new ClerkUserData(id, fullName, email));
                }

                if (page.size() < limit) break;
                offset += limit;
            }

            log.info("Clerk API retornou {} usuarios", usuarios.size());
        } catch (Exception e) {
            log.error("Erro ao buscar usuarios do Clerk: {}", e.getMessage());
        }

        return usuarios;
    }

    private JsonNode buscarPagina(int offset, int limit) {
        return webClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path("/users")
                        .queryParam("limit", limit)
                        .queryParam("offset", offset)
                        .build())
                .header("Authorization", "Bearer " + secretKey)
                .retrieve()
                .bodyToMono(JsonNode.class)
                .block();
    }

    private String extrairEmail(JsonNode node) {
        if (node.has("email_addresses") && node.get("email_addresses").isArray()) {
            for (JsonNode emailNode : node.get("email_addresses")) {
                if (emailNode.has("email_address")) {
                    return emailNode.get("email_address").asText();
                }
            }
        }
        return "";
    }

    public record ClerkUserData(String clerkId, String fullName, String email) {
    }
}
