package com.checklist.module.auth;

public enum UserRole {
    ADMIN,
    SUPERVISOR,
    OPERATOR;

    public boolean isHigherThan(UserRole other) {
        return priority() < other.priority();
    }

    public boolean isAtLeast(UserRole other) {
        return priority() <= other.priority();
    }

    private int priority() {
        return switch (this) {
            case ADMIN -> 0;
            case SUPERVISOR -> 1;
            case OPERATOR -> 2;
        };
    }
}
