package com.checklist.module.item;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ItemAttachmentDTO {
    private Long id;
    private String fileName;
    private String fileUrl;
    private LocalDateTime createdAt;
}
