package com.checklist.module.auth;

import com.checklist.exception.ForbiddenException;
import com.checklist.module.checklist.Checklist;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AccessControlService {

    public List<UserAccount> filterAssignableUsers(UserAccount actor, List<UserAccount> users) {
        return users.stream()
                .filter(candidate -> canAssignChecklist(actor, candidate))
                .toList();
    }

    public boolean canViewChecklist(UserAccount actor, Checklist checklist) {
        if (actor.getRole() == UserRole.ADMIN) {
            return true;
        }

        if (actor.getRole() == UserRole.OPERATOR) {
            return checklist.getAssignedTo() != null && checklist.getAssignedTo().getId().equals(actor.getId());
        }

        if (checklist.getAssignedTo() != null && checklist.getAssignedTo().getId().equals(actor.getId())) {
            return true;
        }

        return actor.getRole() == UserRole.SUPERVISOR
                && actor.getStore() != null
                && checklist.getStore() != null
                && actor.getStore().getId().equals(checklist.getStore().getId());
    }

    public void ensureCanViewChecklist(UserAccount actor, Checklist checklist) {
        if (!canViewChecklist(actor, checklist)) {
            throw new ForbiddenException("You do not have access to this checklist.");
        }
    }

    public boolean canAssignChecklist(UserAccount actor, UserAccount assignee) {
        if (actor.getRole() == UserRole.ADMIN) {
            return true;
        }

        if (actor.getId().equals(assignee.getId())) {
            return true;
        }

        if (actor.getRole() != UserRole.SUPERVISOR) {
            return false;
        }

        return actor.getStore() != null
                && assignee.getStore() != null
                && actor.getStore().getId().equals(assignee.getStore().getId())
                && actor.getRole().isHigherThan(assignee.getRole());
    }

    public void ensureCanAssignChecklist(UserAccount actor, UserAccount assignee) {
        if (!canAssignChecklist(actor, assignee)) {
            throw new ForbiddenException("You cannot assign a checklist to this user.");
        }
    }

    public void ensureCanMarkItemAsRequired(UserAccount actor) {
        if (!actor.getRole().isAtLeast(UserRole.SUPERVISOR)) {
            throw new ForbiddenException("Only admins and supervisors can require attachments.");
        }
    }
}
