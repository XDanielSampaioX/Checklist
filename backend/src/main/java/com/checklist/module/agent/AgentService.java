package com.checklist.module.agent;

import com.checklist.module.checklist.ChecklistDTO;
import com.checklist.module.checklist.ChecklistService;
import com.checklist.module.item.ItemDTO;
import com.checklist.module.item.ItemService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
public class AgentService {

    private final ChecklistService checklistService;
    private final ItemService itemService;

    public AgentResponse processPrompt(String prompt) {
        if (prompt == null || prompt.trim().isEmpty()) {
            return AgentResponse.builder()
                    .action("UNKNOWN")
                    .result("Please provide a prompt.")
                    .success(false)
                    .build();
        }

        String lowerPrompt = prompt.toLowerCase().trim();

        try {
            // Create checklist: "create a checklist called 'Shopping List'"
            if (lowerPrompt.contains("create") && lowerPrompt.contains("checklist")) {
                return handleCreateChecklist(prompt);
            }

            // Add item: "add item 'Buy milk' to checklist 1"
            if ((lowerPrompt.contains("add") || lowerPrompt.contains("create")) && lowerPrompt.contains("item")) {
                return handleAddItem(prompt);
            }

            // Mark complete: "mark checklist 1 as complete"
            if (lowerPrompt.contains("mark") && lowerPrompt.contains("complete")) {
                return handleToggleChecklist(prompt);
            }

            // Toggle complete for checklist
            if (lowerPrompt.contains("toggle") && lowerPrompt.contains("checklist")) {
                return handleToggleChecklist(prompt);
            }

            // List all checklists: "list all checklists"
            if (lowerPrompt.contains("list") && lowerPrompt.contains("checklist")) {
                return handleListChecklists();
            }

            // Show items: "show items in checklist 1"
            if ((lowerPrompt.contains("show") || lowerPrompt.contains("list")) && lowerPrompt.contains("item")) {
                return handleListItems(prompt);
            }

            // Delete checklist: "delete checklist 1"
            if (lowerPrompt.contains("delete") && lowerPrompt.contains("checklist")) {
                return handleDeleteChecklist(prompt);
            }

            // Delete item: "delete item 1"
            if (lowerPrompt.contains("delete") && lowerPrompt.contains("item")) {
                return handleDeleteItem(prompt);
            }

            return AgentResponse.builder()
                    .action("UNKNOWN")
                    .result("I could not understand the prompt. Try: 'create a checklist called X', 'add item Y to checklist N', 'list all checklists', 'show items in checklist N', 'mark checklist N as complete', 'delete checklist N'.")
                    .success(false)
                    .build();

        } catch (Exception e) {
            return AgentResponse.builder()
                    .action("ERROR")
                    .result("An error occurred: " + e.getMessage())
                    .success(false)
                    .build();
        }
    }

    private AgentResponse handleCreateChecklist(String prompt) {
        String title = extractQuotedText(prompt);
        if (title == null) {
            title = extractAfterKeyword(prompt, new String[]{"called", "named", "titled"});
        }
        if (title == null || title.isEmpty()) {
            title = "New Checklist";
        }

        ChecklistDTO dto = ChecklistDTO.builder()
                .title(title)
                .description("")
                .build();
        ChecklistDTO created = checklistService.create(dto);

        return AgentResponse.builder()
                .action("CREATE_CHECKLIST")
                .result("Created checklist '" + created.getTitle() + "' with id " + created.getId())
                .success(true)
                .build();
    }

    private AgentResponse handleAddItem(String prompt) {
        Long checklistId = extractNumber(prompt, new String[]{"checklist", "to checklist", "in checklist"});
        String itemDescription = extractQuotedText(prompt);

        if (itemDescription == null) {
            itemDescription = extractAfterKeyword(prompt, new String[]{"item"});
            if (itemDescription != null) {
                itemDescription = itemDescription.replaceAll("(?i)to checklist.*", "").trim();
                itemDescription = itemDescription.replaceAll("(?i)in checklist.*", "").trim();
            }
        }

        if (checklistId == null) {
            return AgentResponse.builder()
                    .action("ADD_ITEM")
                    .result("Could not determine checklist ID. Try: 'add item \"Buy milk\" to checklist 1'")
                    .success(false)
                    .build();
        }

        if (itemDescription == null || itemDescription.isEmpty()) {
            itemDescription = "New Item";
        }

        ItemDTO dto = ItemDTO.builder()
                .description(itemDescription)
                .completed(false)
                .build();
        ItemDTO created = itemService.create(checklistId, dto);

        return AgentResponse.builder()
                .action("ADD_ITEM")
                .result("Added item '" + created.getDescription() + "' to checklist " + checklistId + " with id " + created.getId())
                .success(true)
                .build();
    }

    private AgentResponse handleToggleChecklist(String prompt) {
        Long checklistId = extractFirstNumber(prompt);

        if (checklistId == null) {
            return AgentResponse.builder()
                    .action("TOGGLE_CHECKLIST")
                    .result("Could not determine checklist ID. Try: 'mark checklist 1 as complete'")
                    .success(false)
                    .build();
        }

        ChecklistDTO toggled = checklistService.toggleComplete(checklistId);

        return AgentResponse.builder()
                .action("TOGGLE_CHECKLIST")
                .result("Checklist " + checklistId + " is now " + (toggled.isCompleted() ? "complete" : "incomplete"))
                .success(true)
                .build();
    }

    private AgentResponse handleListChecklists() {
        List<ChecklistDTO> checklists = checklistService.findAll();

        if (checklists.isEmpty()) {
            return AgentResponse.builder()
                    .action("LIST_CHECKLISTS")
                    .result("No checklists found.")
                    .success(true)
                    .build();
        }

        StringBuilder sb = new StringBuilder("Found " + checklists.size() + " checklist(s):\n");
        for (ChecklistDTO c : checklists) {
            sb.append("- [").append(c.getId()).append("] ")
              .append(c.getTitle())
              .append(" (").append(c.isCompleted() ? "completed" : "active").append(", ")
              .append(c.getItemCount()).append(" items)\n");
        }

        return AgentResponse.builder()
                .action("LIST_CHECKLISTS")
                .result(sb.toString().trim())
                .success(true)
                .build();
    }

    private AgentResponse handleListItems(String prompt) {
        Long checklistId = extractFirstNumber(prompt);

        if (checklistId == null) {
            return AgentResponse.builder()
                    .action("LIST_ITEMS")
                    .result("Could not determine checklist ID. Try: 'show items in checklist 1'")
                    .success(false)
                    .build();
        }

        List<ItemDTO> items = itemService.findByChecklistId(checklistId);

        if (items.isEmpty()) {
            return AgentResponse.builder()
                    .action("LIST_ITEMS")
                    .result("No items found in checklist " + checklistId)
                    .success(true)
                    .build();
        }

        StringBuilder sb = new StringBuilder("Found " + items.size() + " item(s) in checklist " + checklistId + ":\n");
        for (ItemDTO item : items) {
            sb.append("- [").append(item.getId()).append("] ")
              .append(item.getDescription())
              .append(" (").append(item.isCompleted() ? "completed" : "pending").append(")\n");
        }

        return AgentResponse.builder()
                .action("LIST_ITEMS")
                .result(sb.toString().trim())
                .success(true)
                .build();
    }

    private AgentResponse handleDeleteChecklist(String prompt) {
        Long checklistId = extractFirstNumber(prompt);

        if (checklistId == null) {
            return AgentResponse.builder()
                    .action("DELETE_CHECKLIST")
                    .result("Could not determine checklist ID. Try: 'delete checklist 1'")
                    .success(false)
                    .build();
        }

        checklistService.delete(checklistId);

        return AgentResponse.builder()
                .action("DELETE_CHECKLIST")
                .result("Deleted checklist " + checklistId)
                .success(true)
                .build();
    }

    private AgentResponse handleDeleteItem(String prompt) {
        Long itemId = extractFirstNumber(prompt);

        if (itemId == null) {
            return AgentResponse.builder()
                    .action("DELETE_ITEM")
                    .result("Could not determine item ID. Try: 'delete item 1'")
                    .success(false)
                    .build();
        }

        itemService.delete(itemId);

        return AgentResponse.builder()
                .action("DELETE_ITEM")
                .result("Deleted item " + itemId)
                .success(true)
                .build();
    }

    private String extractQuotedText(String prompt) {
        Pattern pattern = Pattern.compile("[\"']([^\"']+)[\"']");
        Matcher matcher = pattern.matcher(prompt);
        if (matcher.find()) {
            return matcher.group(1).trim();
        }
        return null;
    }

    private String extractAfterKeyword(String prompt, String[] keywords) {
        String lowerPrompt = prompt.toLowerCase();
        for (String keyword : keywords) {
            int idx = lowerPrompt.indexOf(keyword);
            if (idx != -1) {
                String after = prompt.substring(idx + keyword.length()).trim();
                after = after.replaceAll("^(a |an |the )", "").trim();
                return after.isEmpty() ? null : after;
            }
        }
        return null;
    }

    private Long extractFirstNumber(String prompt) {
        Pattern pattern = Pattern.compile("\\d+");
        Matcher matcher = pattern.matcher(prompt);
        if (matcher.find()) {
            return Long.parseLong(matcher.group());
        }
        return null;
    }

    private Long extractNumber(String prompt, String[] contextKeywords) {
        String lowerPrompt = prompt.toLowerCase();
        for (String keyword : contextKeywords) {
            int idx = lowerPrompt.indexOf(keyword);
            if (idx != -1) {
                String after = prompt.substring(idx + keyword.length()).trim();
                Pattern pattern = Pattern.compile("^\\s*(\\d+)");
                Matcher matcher = pattern.matcher(after);
                if (matcher.find()) {
                    return Long.parseLong(matcher.group(1));
                }
            }
        }
        return extractFirstNumber(prompt);
    }
}
