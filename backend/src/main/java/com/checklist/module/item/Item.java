package com.checklist.module.item;

import com.checklist.module.checklist.Checklist;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "items")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Item {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String description;

    private boolean completed;

    @Column(name = "item_order")
    private Integer order;

    @Column(nullable = false)
    private boolean requiredAttachment;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "checklist_id", nullable = false)
    private Checklist checklist;

    @OneToMany(mappedBy = "item", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<ItemAttachment> attachments = new ArrayList<>();

    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    public boolean canBeCompleted() {
        return !requiredAttachment || !attachments.isEmpty();
    }

    public void setCompleted(boolean completed) {
        this.completed = completed && canBeCompleted();
    }
}
