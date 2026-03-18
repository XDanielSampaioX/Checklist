package com.checklist.module.auth;

import com.checklist.exception.UnauthorizedException;
import org.springframework.stereotype.Component;

@Component
public class CurrentUserContext {

    private static final ThreadLocal<UserAccount> CURRENT = new ThreadLocal<>();

    public void set(UserAccount user) {
        CURRENT.set(user);
    }

    public UserAccount getRequiredUser() {
        UserAccount user = CURRENT.get();
        if (user == null) {
            throw new UnauthorizedException("Authentication is required.");
        }
        return user;
    }

    public void clear() {
        CURRENT.remove();
    }
}
