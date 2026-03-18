package com.checklist.module.auth;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserSummaryDTO {
    private Long id;
    private String name;
    private String email;
    private UserRole role;
    private Long supervisorId;
    private Long storeId;
    private String storeCode;
    private String storeName;
}
