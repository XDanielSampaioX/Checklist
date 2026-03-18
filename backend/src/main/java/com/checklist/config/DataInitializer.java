package com.checklist.config;

import com.checklist.module.auth.UserAccount;
import com.checklist.module.auth.UserAccountRepository;
import com.checklist.module.auth.UserRole;
import com.checklist.module.store.Store;
import com.checklist.module.store.StoreRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final StoreRepository storeRepository;
    private final UserAccountRepository userAccountRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        if (userAccountRepository.count() > 0) {
            return;
        }

        Store north = storeRepository.save(Store.builder().code("LOJA-NORTE").name("Loja Norte").build());
        Store south = storeRepository.save(Store.builder().code("LOJA-SUL").name("Loja Sul").build());

        UserAccount admin = userAccountRepository.save(UserAccount.builder()
                .name("Administrador")
                .email("admin@checklist.local")
                .passwordHash(passwordEncoder.encode("admin123"))
                .role(UserRole.ADMIN)
                .build());

        UserAccount northSupervisor = userAccountRepository.save(UserAccount.builder()
                .name("Supervisor Norte")
                .email("supervisor.norte@checklist.local")
                .passwordHash(passwordEncoder.encode("admin123"))
                .role(UserRole.SUPERVISOR)
                .supervisor(admin)
                .store(north)
                .build());

        UserAccount southSupervisor = userAccountRepository.save(UserAccount.builder()
                .name("Supervisor Sul")
                .email("supervisor.sul@checklist.local")
                .passwordHash(passwordEncoder.encode("admin123"))
                .role(UserRole.SUPERVISOR)
                .supervisor(admin)
                .store(south)
                .build());

        userAccountRepository.save(UserAccount.builder()
                .name("Operador Norte 1")
                .email("operador1.norte@checklist.local")
                .passwordHash(passwordEncoder.encode("admin123"))
                .role(UserRole.OPERATOR)
                .supervisor(northSupervisor)
                .store(north)
                .build());

        userAccountRepository.save(UserAccount.builder()
                .name("Operador Norte 2")
                .email("operador2.norte@checklist.local")
                .passwordHash(passwordEncoder.encode("admin123"))
                .role(UserRole.OPERATOR)
                .supervisor(northSupervisor)
                .store(north)
                .build());

        userAccountRepository.save(UserAccount.builder()
                .name("Operador Sul 1")
                .email("operador1.sul@checklist.local")
                .passwordHash(passwordEncoder.encode("admin123"))
                .role(UserRole.OPERATOR)
                .supervisor(southSupervisor)
                .store(south)
                .build());
    }
}
