package com.checklist.module.store;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/stores")
@RequiredArgsConstructor
public class StoreController {

    private final StoreRepository storeRepository;

    @GetMapping
    public ResponseEntity<List<StoreDTO>> listAll() {
        List<StoreDTO> stores = storeRepository.findAll().stream()
                .map(store -> StoreDTO.builder()
                        .id(store.getId())
                        .code(store.getCode())
                        .name(store.getName())
                        .build())
                .toList();
        return ResponseEntity.ok(stores);
    }
}
