package com.checklist.module.checklist;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardReportDTO {

    private int totalChecklists;
    private int completedCount;
    private int completedLateCount;
    private int inProgressCount;
    private int overdueCount;
    private int totalItems;
    private double completionRate;
    private double overdueRate;
    private List<ChecklistDTO> recentChecklists;
    private List<ChecklistDTO> overdueChecklists;
}
