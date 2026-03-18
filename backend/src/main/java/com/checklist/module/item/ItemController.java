package com.checklist.module.item;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/checklists/{checklistId}/items")
@RequiredArgsConstructor
public class ItemController {

    private final ItemService itemService;

    @GetMapping
    public ResponseEntity<List<ItemDTO>> getByChecklistId(@PathVariable Long checklistId) {
        return ResponseEntity.ok(itemService.findByChecklistId(checklistId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ItemDTO> getById(@PathVariable Long checklistId, @PathVariable Long id) {
        try {
            return ResponseEntity.ok(itemService.findById(id));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping
    public ResponseEntity<ItemDTO> create(@PathVariable Long checklistId, @RequestBody ItemDTO dto) {
        try {
            return ResponseEntity.status(HttpStatus.CREATED).body(itemService.create(checklistId, dto));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<ItemDTO> update(@PathVariable Long checklistId, @PathVariable Long id, @RequestBody ItemDTO dto) {
        try {
            return ResponseEntity.ok(itemService.update(id, dto));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long checklistId, @PathVariable Long id) {
        try {
            itemService.delete(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PatchMapping("/{id}/toggle")
    public ResponseEntity<ItemDTO> toggleComplete(@PathVariable Long checklistId, @PathVariable Long id) {
        try {
            return ResponseEntity.ok(itemService.toggleComplete(id));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
}
