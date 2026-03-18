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
        return ResponseEntity.ok(itemService.findById(id));
    }

    @PostMapping
    public ResponseEntity<ItemDTO> create(@PathVariable Long checklistId, @RequestBody ItemDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(itemService.create(checklistId, dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ItemDTO> update(@PathVariable Long checklistId, @PathVariable Long id, @RequestBody ItemDTO dto) {
        return ResponseEntity.ok(itemService.update(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long checklistId, @PathVariable Long id) {
        itemService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/toggle")
    public ResponseEntity<ItemDTO> toggleComplete(@PathVariable Long checklistId, @PathVariable Long id) {
        return ResponseEntity.ok(itemService.toggleComplete(id));
    }

    @PostMapping("/{id}/attachments")
    public ResponseEntity<ItemAttachmentDTO> addAttachment(@PathVariable Long checklistId, @PathVariable Long id, @RequestBody ItemAttachmentDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(itemService.addAttachment(id, dto));
    }

    @DeleteMapping("/{id}/attachments/{attachmentId}")
    public ResponseEntity<Void> removeAttachment(@PathVariable Long checklistId, @PathVariable Long id, @PathVariable Long attachmentId) {
        itemService.removeAttachment(id, attachmentId);
        return ResponseEntity.noContent().build();
    }
}
