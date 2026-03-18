package com.checklist.module.checklist;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class ChecklistService {

    private final ChecklistRepository checklistRepository;

    public List<ChecklistDTO> findAll() {
        return checklistRepository.findAll()
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public ChecklistDTO findById(Long id) {
        Checklist checklist = checklistRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Checklist not found with id: " + id));
        return toDTO(checklist);
    }

    public ChecklistDTO create(ChecklistDTO dto) {
        Checklist checklist = Checklist.builder()
                .title(dto.getTitle())
                .description(dto.getDescription())
                .completed(false)
                .build();
        return toDTO(checklistRepository.save(checklist));
    }

    public ChecklistDTO update(Long id, ChecklistDTO dto) {
        Checklist checklist = checklistRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Checklist not found with id: " + id));
        checklist.setTitle(dto.getTitle());
        checklist.setDescription(dto.getDescription());
        checklist.setCompleted(dto.isCompleted());
        return toDTO(checklistRepository.save(checklist));
    }

    public void delete(Long id) {
        if (!checklistRepository.existsById(id)) {
            throw new RuntimeException("Checklist not found with id: " + id);
        }
        checklistRepository.deleteById(id);
    }

    public ChecklistDTO toggleComplete(Long id) {
        Checklist checklist = checklistRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Checklist not found with id: " + id));
        checklist.setCompleted(!checklist.isCompleted());
        return toDTO(checklistRepository.save(checklist));
    }

    public ChecklistDTO toDTO(Checklist checklist) {
        return ChecklistDTO.builder()
                .id(checklist.getId())
                .title(checklist.getTitle())
                .description(checklist.getDescription())
                .createdAt(checklist.getCreatedAt())
                .updatedAt(checklist.getUpdatedAt())
                .completed(checklist.isCompleted())
                .itemCount(checklist.getItems() != null ? checklist.getItems().size() : 0)
                .build();
    }

    public Checklist findEntityById(Long id) {
        return checklistRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Checklist not found with id: " + id));
    }
}
