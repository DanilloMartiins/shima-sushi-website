package br.com.seushimasushi.backend.webhook.repository;

import br.com.seushimasushi.backend.webhook.model.WebhookEvent;
import br.com.seushimasushi.backend.webhook.model.WebhookEventStatus;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface WebhookEventRepository extends JpaRepository<WebhookEvent, Long> {

    Optional<WebhookEvent> findByEventId(String eventId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT e FROM WebhookEvent e WHERE e.status = :status ORDER BY e.createdAt ASC")
    List<WebhookEvent> findPendingWithLock(@Param("status") WebhookEventStatus status);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query(value = "SELECT * FROM webhook_events WHERE status IN (:statuses) ORDER BY created_at ASC LIMIT :limit FOR UPDATE SKIP LOCKED",
           nativeQuery = true)
    List<WebhookEvent> findPendingOrRetryWithLockAndLimit(@Param("statuses") List<String> statuses,
                                                          @Param("limit") int limit);

    @Query("SELECT e FROM WebhookEvent e WHERE e.status = :status AND e.createdAt < :threshold ORDER BY e.createdAt ASC")
    List<WebhookEvent> findStuckEvents(@Param("status") WebhookEventStatus status,
                                       @Param("threshold") LocalDateTime threshold);
}
