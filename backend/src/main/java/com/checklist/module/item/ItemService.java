package com.checklist.module.item;

import com.checklist.exception.BusinessException;
import com.checklist.exception.NotFoundException;
import com.checklist.module.auth.AccessControlService;
import com.checklist.module.auth.CurrentUserContext;
import com.checklist.module.auth.UserAccount;
import com.checklist.module.auth.UserRole;
import com.checklist.module.checklist.Checklist;
import com.checklist.module.checklist.ChecklistService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class ItemService {

    private final ItemRepository itemRepository;
    private final ItemAttachmentRepository itemAttachmentRepository;
    private final ChecklistService checklistService;
    private final ItemMapper itemMapper;
    private final CurrentUserContext currentUserContext;
    private final AccessControlService accessControlService;

    public List<ItemDTO> findByChecklistId(Long checklistId) {
        Checklist checklist = checklistService.findEntityById(checklistId);
        accessControlService.ensureCanViewChecklist(currentUserContext.getRequiredUser(), checklist);
        return itemRepository.findByChecklistIdOrderByOrderAscIdAsc(checklistId)
                .stream()
                .map(itemMapper::toDTO)
                .collect(Collectors.toList());
    }

    public ItemDTO findById(Long id) {
        Item item = findEntityById(id);
        accessControlService.ensureCanViewChecklist(currentUserContext.getRequiredUser(), item.getChecklist());
        return itemMapper.toDTO(item);
    }

    public ItemDTO create(Long checklistId, ItemDTO dto) {
        UserAccount actor = currentUserContext.getRequiredUser();
        Checklist checklist = checklistService.findEntityById(checklistId);
        accessControlService.ensureCanViewChecklist(actor, checklist);
        boolean requiredAttachment = resolveRequiredAttachment(actor, dto.isRequiredAttachment(), false);
        Item item = Item.builder()
                .description(dto.getDescription())
                .completed(false)
                .order(dto.getOrder())
                .requiredAttachment(requiredAttachment)
                .checklist(checklist)
                .build();
        return itemMapper.toDTO(itemRepository.save(item));
    }

    public ItemDTO update(Long id, ItemDTO dto) {
        UserAccount actor = currentUserContext.getRequiredUser();
        Item item = findEntityById(id);
        accessControlService.ensureCanViewChecklist(actor, item.getChecklist());
        item.setDescription(dto.getDescription());
        item.setOrder(dto.getOrder());
        item.setRequiredAttachment(resolveRequiredAttachment(actor, dto.isRequiredAttachment(), item.isRequiredAttachment()));

        if (dto.isCompleted() && !item.canBeCompleted()) {
            throw new BusinessException("This item requires at least one attachment before completion.");
        }

        item.setCompleted(dto.isCompleted());
        Item saved = itemRepository.save(item);
        checklistService.syncChecklistProgress(saved.getChecklist());
        return itemMapper.toDTO(saved);
    }

    public void delete(Long id) {
        Item item = findEntityById(id);
        accessControlService.ensureCanViewChecklist(currentUserContext.getRequiredUser(), item.getChecklist());
        Checklist checklist = item.getChecklist();
        itemRepository.delete(item);
        checklistService.syncChecklistProgress(checklist);
    }

    public ItemDTO toggleComplete(Long id) {
        Item item = findEntityById(id);
        accessControlService.ensureCanViewChecklist(currentUserContext.getRequiredUser(), item.getChecklist());

        if (!item.isCompleted() && !item.canBeCompleted()) {
            throw new BusinessException("This item requires at least one attachment before completion.");
        }

        item.setCompleted(!item.isCompleted());
        Item saved = itemRepository.save(item);
        checklistService.syncChecklistProgress(saved.getChecklist());
        return itemMapper.toDTO(saved);
    }

    public ItemAttachmentDTO addAttachment(Long itemId, ItemAttachmentDTO dto) {
        Item item = findEntityById(itemId);
        accessControlService.ensureCanViewChecklist(currentUserContext.getRequiredUser(), item.getChecklist());
        ItemAttachment attachment = ItemAttachment.builder()
                .item(item)
                .fileName(dto.getFileName())
                .fileUrl(dto.getFileUrl())
                .build();
        item.getAttachments().add(attachment);
        itemRepository.save(item);
        return itemMapper.toAttachmentDTO(attachment);
    }

    public void removeAttachment(Long itemId, Long attachmentId) {
        Item item = findEntityById(itemId);
        accessControlService.ensureCanViewChecklist(currentUserContext.getRequiredUser(), item.getChecklist());
        ItemAttachment attachment = item.getAttachments().stream()
                .filter(candidate -> candidate.getId().equals(attachmentId))
                .findFirst()
                .orElseThrow(() -> new NotFoundException("Attachment not found with id: " + attachmentId));

        item.getAttachments().remove(attachment);
        itemAttachmentRepository.delete(attachment);

        if (item.isRequiredAttachment() && item.getAttachments().isEmpty()) {
            item.setCompleted(false);
        }

        itemRepository.save(item);
        checklistService.syncChecklistProgress(item.getChecklist());
    }

    public Item findEntityById(Long id) {
        return itemRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Item not found with id: " + id));
    }

    private boolean resolveRequiredAttachment(UserAccount actor, boolean requestedValue, boolean currentValue) {
        if (requestedValue != currentValue && actor.getRole() == UserRole.OPERATOR) {
            accessControlService.ensureCanMarkItemAsRequired(actor);
        }
        return requestedValue;
    }
}
