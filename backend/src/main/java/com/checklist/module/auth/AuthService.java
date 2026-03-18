package com.checklist.module.auth;

import com.checklist.exception.NotFoundException;
import com.checklist.exception.UnauthorizedException;
import com.checklist.module.store.Store;
import com.checklist.module.store.StoreRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class AuthService {

    private final UserAccountRepository userAccountRepository;
    private final AuthSessionRepository authSessionRepository;
    private final PasswordEncoder passwordEncoder;
    private final CurrentUserContext currentUserContext;
    private final UsuarioMapper usuarioMapper;
    private final AccessControlService accessControlService;
    private final StoreRepository storeRepository;

    public LoginResponse login(LoginRequest request) {
        UserAccount user = userAccountRepository.findByEmailIgnoreCase(request.getEmail())
                .orElseThrow(() -> new UnauthorizedException("Invalid credentials."));

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new UnauthorizedException("Invalid credentials.");
        }

        authSessionRepository.deleteByExpiresAtBefore(LocalDateTime.now());

        AuthSession session = AuthSession.builder()
                .token(UUID.randomUUID().toString())
                .user(user)
                .expiresAt(LocalDateTime.now().plusHours(12))
                .build();

        authSessionRepository.save(session);

        return LoginResponse.builder()
                .token(session.getToken())
                .user(usuarioMapper.toDTO(user))
                .build();
    }

    public LoginResponse register(RegisterRequest request) {
        if (request.getEmail() == null || request.getEmail().isBlank()) {
            throw new UnauthorizedException("Email is required.");
        }
        if (request.getPassword() == null || request.getPassword().length() < 6) {
            throw new UnauthorizedException("Password must be at least 6 characters.");
        }
        if (request.getName() == null || request.getName().isBlank()) {
            throw new UnauthorizedException("Name is required.");
        }
        if (userAccountRepository.findByEmailIgnoreCase(request.getEmail()).isPresent()) {
            throw new UnauthorizedException("Email already registered.");
        }

        Store store = storeRepository.findById(request.getStoreId())
                .orElseThrow(() -> new NotFoundException("Store not found."));

        UserAccount supervisor = userAccountRepository.findFirstByStoreIdAndRole(store.getId(), UserRole.SUPERVISOR)
                .orElse(null);

        UserAccount user = userAccountRepository.save(UserAccount.builder()
                .name(request.getName().trim())
                .email(request.getEmail().trim().toLowerCase())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .role(UserRole.OPERATOR)
                .store(store)
                .supervisor(supervisor)
                .build());

        AuthSession session = AuthSession.builder()
                .token(UUID.randomUUID().toString())
                .user(user)
                .expiresAt(LocalDateTime.now().plusHours(12))
                .build();

        authSessionRepository.save(session);

        return LoginResponse.builder()
                .token(session.getToken())
                .user(usuarioMapper.toDTO(user))
                .build();
    }

    @Transactional(readOnly = true)
    public UserAccount authenticate(String token) {
        AuthSession session = authSessionRepository.findByToken(token)
                .orElseThrow(() -> new UnauthorizedException("Invalid token."));

        if (session.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new UnauthorizedException("Session expired.");
        }

        return session.getUser();
    }

    @Transactional(readOnly = true)
    public UserSummaryDTO me() {
        return usuarioMapper.toDTO(currentUserContext.getRequiredUser());
    }

    @Transactional(readOnly = true)
    public List<UserSummaryDTO> listAssignableUsers() {
        UserAccount actor = currentUserContext.getRequiredUser();
        return accessControlService.filterAssignableUsers(actor, userAccountRepository.findAll())
                .stream()
                .map(usuarioMapper::toDTO)
                .toList();
    }

    @Transactional(readOnly = true)
    public UserAccount findUserById(Long id) {
        return userAccountRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("User not found with id: " + id));
    }
}
