package com.checklist.module.checklist;

import com.checklist.module.auth.UserAccount;
import com.checklist.module.item.Item;
import com.checklist.module.store.Store;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "checklists")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Checklist {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    private String description;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    private LocalDateTime dueDate;

    private LocalDateTime completedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assigned_to_user_id")
    private UserAccount assignedTo;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by_user_id")
    private UserAccount createdBy;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "store_id")
    private Store store;

    @OneToMany(mappedBy = "checklist", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @Builder.Default
    private List<Item> items = new ArrayList<>();

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public ChecklistStatus getStatus() {
        return getStatusAt(LocalDateTime.now());
    }

    public ChecklistStatus getStatusAt(LocalDateTime referenceTime) {
        if (completedAt != null) {
            if (dueDate != null && completedAt.isAfter(dueDate)) {
                return ChecklistStatus.COMPLETED_LATE;
            }
            return ChecklistStatus.COMPLETED;
        }

        if (dueDate != null && referenceTime.isAfter(dueDate)) {
            return ChecklistStatus.OVERDUE;
        }

        return ChecklistStatus.IN_PROGRESS;
    }

    public boolean isCompleted() {
        return completedAt != null;
    }

    public boolean isOverdue() {
        return getStatus() == ChecklistStatus.OVERDUE;
    }

    public void markCompleted() {
        completedAt = LocalDateTime.now();
    }

    public void reopen() {
        completedAt = null;
    }

    public boolean hasPendingItems() {
        return items != null && items.stream().anyMatch(item -> !item.isCompleted());
    }

    public void syncCompletionStateWithItems() {
        if (hasPendingItems()) {
            reopen();
        }
    }
}
