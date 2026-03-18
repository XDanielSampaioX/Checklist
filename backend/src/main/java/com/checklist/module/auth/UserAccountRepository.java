package com.checklist.module.auth;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UserAccountRepository extends JpaRepository<UserAccount, Long> {
    Optional<UserAccount> findByEmailIgnoreCase(String email);
    List<UserAccount> findByStoreId(Long storeId);
    List<UserAccount> findBySupervisorId(Long supervisorId);
    Optional<UserAccount> findFirstByStoreIdAndRole(Long storeId, UserRole role);
}
