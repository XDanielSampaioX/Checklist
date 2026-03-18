package com.checklist.module.checklist;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChecklistDTO {

    private Long id;
    private String title;
    private String description;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime dueDate;
    private LocalDateTime completedAt;
    private boolean completed;
    private ChecklistStatus status;
    private boolean overdue;
    private int itemCount;
    private Long assignedToUserId;
    private String assignedToUserName;
    private Long createdByUserId;
    private String createdByUserName;
    private Long storeId;
    private String storeCode;
    private String storeName;
}
