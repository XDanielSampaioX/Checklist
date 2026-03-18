package com.checklist.module.checklist;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChecklistRepository extends JpaRepository<Checklist, Long> {
    List<Checklist> findByStoreId(Long storeId);
    List<Checklist> findByAssignedToId(Long userId);
}
