package com.checklist.module.item;

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
    private final ChecklistService checklistService;

    public List<ItemDTO> findByChecklistId(Long checklistId) {
        return itemRepository.findByChecklistId(checklistId)
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public ItemDTO findById(Long id) {
        Item item = itemRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Item not found with id: " + id));
        return toDTO(item);
    }

    public ItemDTO create(Long checklistId, ItemDTO dto) {
        Checklist checklist = checklistService.findEntityById(checklistId);
        Item item = Item.builder()
                .description(dto.getDescription())
                .completed(false)
                .order(dto.getOrder())
                .checklist(checklist)
                .build();
        return toDTO(itemRepository.save(item));
    }

    public ItemDTO update(Long id, ItemDTO dto) {
        Item item = itemRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Item not found with id: " + id));
        item.setDescription(dto.getDescription());
        item.setCompleted(dto.isCompleted());
        item.setOrder(dto.getOrder());
        return toDTO(itemRepository.save(item));
    }

    public void delete(Long id) {
        if (!itemRepository.existsById(id)) {
            throw new RuntimeException("Item not found with id: " + id);
        }
        itemRepository.deleteById(id);
    }

    public ItemDTO toggleComplete(Long id) {
        Item item = itemRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Item not found with id: " + id));
        item.setCompleted(!item.isCompleted());
        return toDTO(itemRepository.save(item));
    }

    public ItemDTO toDTO(Item item) {
        return ItemDTO.builder()
                .id(item.getId())
                .description(item.getDescription())
                .completed(item.isCompleted())
                .order(item.getOrder())
                .checklistId(item.getChecklist() != null ? item.getChecklist().getId() : null)
                .createdAt(item.getCreatedAt())
                .build();
    }
}
