package com.checklist.module.checklist;

import com.checklist.exception.BusinessException;
import com.checklist.exception.NotFoundException;
import com.checklist.module.auth.AccessControlService;
import com.checklist.module.auth.AuthService;
import com.checklist.module.auth.CurrentUserContext;
import com.checklist.module.auth.UserAccount;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class ChecklistService {

    private final ChecklistRepository checklistRepository;
    private final ChecklistMapper checklistMapper;
    private final CurrentUserContext currentUserContext;
    private final AuthService authService;
    private final AccessControlService accessControlService;

    public List<ChecklistDTO> findAll() {
        UserAccount actor = currentUserContext.getRequiredUser();
        return visibleChecklists(actor).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public ChecklistDTO findById(Long id) {
        UserAccount actor = currentUserContext.getRequiredUser();
        Checklist checklist = findEntityById(id);
        accessControlService.ensureCanViewChecklist(actor, checklist);
        return toDTO(checklist);
    }

    public ChecklistDTO create(ChecklistDTO dto) {
        UserAccount actor = currentUserContext.getRequiredUser();
        UserAccount assignee = resolveAssignee(actor, dto.getAssignedToUserId());
        Checklist checklist = Checklist.builder()
                .title(dto.getTitle())
                .description(dto.getDescription())
                .dueDate(dto.getDueDate())
                .assignedTo(assignee)
                .createdBy(actor)
                .store(assignee.getStore())
                .build();
        if (dto.isCompleted()) {
            if (checklist.hasPendingItems()) {
                throw new BusinessException("Checklist cannot be completed while it has pending items.");
            }
            checklist.markCompleted();
        }
        return toDTO(checklistRepository.save(checklist));
    }

    public ChecklistDTO update(Long id, ChecklistDTO dto) {
        UserAccount actor = currentUserContext.getRequiredUser();
        Checklist checklist = findEntityById(id);
        accessControlService.ensureCanViewChecklist(actor, checklist);
        checklist.setTitle(dto.getTitle());
        checklist.setDescription(dto.getDescription());
        checklist.setDueDate(dto.getDueDate());
        if (dto.getAssignedToUserId() != null) {
            UserAccount assignee = resolveAssignee(actor, dto.getAssignedToUserId());
            checklist.setAssignedTo(assignee);
            checklist.setStore(assignee.getStore());
        }
        if (dto.isCompleted()) {
            if (checklist.hasPendingItems()) {
                throw new BusinessException("Checklist cannot be completed while it has pending items.");
            }
            if (!checklist.isCompleted()) {
                checklist.markCompleted();
            }
        } else if (checklist.isCompleted()) {
            checklist.reopen();
        }
        return toDTO(checklistRepository.save(checklist));
    }

    public void delete(Long id) {
        UserAccount actor = currentUserContext.getRequiredUser();
        Checklist checklist = findEntityById(id);
        accessControlService.ensureCanViewChecklist(actor, checklist);
        checklistRepository.delete(checklist);
    }

    public ChecklistDTO toggleComplete(Long id) {
        UserAccount actor = currentUserContext.getRequiredUser();
        Checklist checklist = findEntityById(id);
        accessControlService.ensureCanViewChecklist(actor, checklist);
        if (checklist.isCompleted()) {
            checklist.reopen();
        } else {
            if (checklist.hasPendingItems()) {
                throw new BusinessException("Complete all items before finishing the checklist.");
            }
            checklist.markCompleted();
        }
        return toDTO(checklistRepository.save(checklist));
    }

    public DashboardReportDTO getDashboardReport() {
        List<ChecklistDTO> checklists = findAll();
        int totalChecklists = checklists.size();
        int completedCount = (int) checklists.stream().filter(ChecklistDTO::isCompleted).count();
        int completedLateCount = (int) checklists.stream().filter(c -> c.getStatus() == ChecklistStatus.COMPLETED_LATE).count();
        int overdueCount = (int) checklists.stream().filter(ChecklistDTO::isOverdue).count();
        int inProgressCount = (int) checklists.stream().filter(c -> c.getStatus() == ChecklistStatus.IN_PROGRESS).count();
        int totalItems = checklists.stream().mapToInt(ChecklistDTO::getItemCount).sum();

        double completionRate = totalChecklists == 0 ? 0.0 : ((double) completedCount / totalChecklists) * 100.0;
        double overdueRate = totalChecklists == 0 ? 0.0 : ((double) overdueCount / totalChecklists) * 100.0;

        List<ChecklistDTO> recentChecklists = checklists.stream()
                .sorted(Comparator.comparing(ChecklistDTO::getUpdatedAt, Comparator.nullsLast(Comparator.reverseOrder())))
                .limit(5)
                .collect(Collectors.toList());

        List<ChecklistDTO> overdueChecklists = checklists.stream()
                .filter(ChecklistDTO::isOverdue)
                .sorted(Comparator.comparing(ChecklistDTO::getDueDate, Comparator.nullsLast(Comparator.naturalOrder())))
                .collect(Collectors.toList());

        return DashboardReportDTO.builder()
                .totalChecklists(totalChecklists)
                .completedCount(completedCount)
                .completedLateCount(completedLateCount)
                .inProgressCount(inProgressCount)
                .overdueCount(overdueCount)
                .totalItems(totalItems)
                .completionRate(completionRate)
                .overdueRate(overdueRate)
                .recentChecklists(recentChecklists)
                .overdueChecklists(overdueChecklists)
                .build();
    }

    public ChecklistDTO toDTO(Checklist checklist) {
        return checklistMapper.toDTO(checklist);
    }

    public Checklist findEntityById(Long id) {
        return checklistRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Checklist not found with id: " + id));
    }

    public void syncChecklistProgress(Checklist checklist) {
        checklist.syncCompletionStateWithItems();
        checklistRepository.save(checklist);
    }

    private List<Checklist> visibleChecklists(UserAccount actor) {
        return checklistRepository.findAll().stream()
                .filter(checklist -> accessControlService.canViewChecklist(actor, checklist))
                .collect(Collectors.toList());
    }

    private UserAccount resolveAssignee(UserAccount actor, Long assigneeId) {
        Long targetId = assigneeId != null ? assigneeId : actor.getId();
        UserAccount assignee = authService.findUserById(targetId);
        accessControlService.ensureCanAssignChecklist(actor, assignee);
        return assignee;
    }
}
