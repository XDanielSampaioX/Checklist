package com.checklist.module.checklist;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/checklists")
@RequiredArgsConstructor
public class ChecklistController {

    private final ChecklistService checklistService;

    @GetMapping
    public ResponseEntity<List<ChecklistDTO>> getAll() {
        return ResponseEntity.ok(checklistService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ChecklistDTO> getById(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(checklistService.findById(id));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping
    public ResponseEntity<ChecklistDTO> create(@RequestBody ChecklistDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(checklistService.create(dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ChecklistDTO> update(@PathVariable Long id, @RequestBody ChecklistDTO dto) {
        try {
            return ResponseEntity.ok(checklistService.update(id, dto));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        try {
            checklistService.delete(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PatchMapping("/{id}/toggle")
    public ResponseEntity<ChecklistDTO> toggleComplete(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(checklistService.toggleComplete(id));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
}
