package com.checklist.module.item;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ItemDTO {

    private Long id;
    private String description;
    private boolean completed;
    private boolean requiredAttachment;
    private Integer order;
    private Long checklistId;
    private LocalDateTime createdAt;
    private List<ItemAttachmentDTO> attachments;
}
