package com.checklist.module.auth;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/auth/login")
    public ResponseEntity<LoginResponse> login(@RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @PostMapping("/auth/register")
    public ResponseEntity<LoginResponse> register(@RequestBody RegisterRequest request) {
        return ResponseEntity.ok(authService.register(request));
    }

    @GetMapping("/auth/me")
    public ResponseEntity<UserSummaryDTO> me() {
        return ResponseEntity.ok(authService.me());
    }

    @GetMapping("/users/assignable")
    public ResponseEntity<List<UserSummaryDTO>> assignableUsers() {
        return ResponseEntity.ok(authService.listAssignableUsers());
    }
}
