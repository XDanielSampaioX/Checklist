package com.checklist.module.auth;

import com.checklist.exception.UnauthorizedException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.http.HttpMethod;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
@RequiredArgsConstructor
public class AuthTokenFilter extends OncePerRequestFilter {

    private final AuthService authService;
    private final CurrentUserContext currentUserContext;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        try {
            if (requiresAuthentication(request)) {
                String header = request.getHeader("Authorization");
                if (header == null || !header.startsWith("Bearer ")) {
                    throw new UnauthorizedException("Missing bearer token.");
                }

                String token = header.substring(7);
                currentUserContext.set(authService.authenticate(token));
            }

            filterChain.doFilter(request, response);
        } catch (UnauthorizedException ex) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.setContentType("application/json");
            response.getWriter().write("{\"message\":\"" + ex.getMessage() + "\"}");
        } finally {
            currentUserContext.clear();
        }
    }

    private boolean requiresAuthentication(HttpServletRequest request) {
        String path = request.getRequestURI();
        if (HttpMethod.OPTIONS.matches(request.getMethod())) {
            return false;
        }
        return path.startsWith("/api")
                && !path.startsWith("/api/auth/login")
                && !path.startsWith("/api-docs")
                && !path.startsWith("/swagger-ui")
                && !path.startsWith("/h2-console");
    }
}
