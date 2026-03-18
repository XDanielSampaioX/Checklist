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
                    .result("Envie um comando para eu executar.")
                    .success(false)
                    .build();
        }

        String lowerPrompt = normalize(prompt);

        try {
            if (isChecklistCreationPrompt(lowerPrompt)) {
                return handleCreateChecklist(prompt);
            }

            if (isItemCreationPrompt(lowerPrompt)) {
                return handleAddItem(prompt);
            }

            if (isChecklistTogglePrompt(lowerPrompt)) {
                return handleToggleChecklist(prompt);
            }

            if (isChecklistListPrompt(lowerPrompt)) {
                return handleListChecklists();
            }

            if (isItemListPrompt(lowerPrompt)) {
                return handleListItems(prompt);
            }

            if (isChecklistDeletePrompt(lowerPrompt)) {
                return handleDeleteChecklist(prompt);
            }

            if (isItemDeletePrompt(lowerPrompt)) {
                return handleDeleteItem(prompt);
            }

            return AgentResponse.builder()
                    .action("UNKNOWN")
                    .result("Nao entendi o comando. Tente algo como: 'crie uma checklist chamada Loja', 'adicione o item Caixa na checklist 2', 'liste todas as checklists', 'mostre os itens da checklist 2' ou 'conclua a checklist 2'.")
                    .success(false)
                    .build();

        } catch (Exception e) {
            return AgentResponse.builder()
                    .action("ERROR")
                    .result("Ocorreu um erro: " + e.getMessage())
                    .success(false)
                    .build();
        }
    }

    private AgentResponse handleCreateChecklist(String prompt) {
        String title = extractQuotedText(prompt);
        if (title == null) {
            title = extractAfterKeyword(prompt, new String[]{"called", "named", "titled", "chamada", "chamado", "com nome", "nomeada"});
        }
        if (title == null || title.isEmpty()) {
            title = "Nova Checklist";
        }

        ChecklistDTO dto = ChecklistDTO.builder()
                .title(title)
                .description("")
                .build();
        ChecklistDTO created = checklistService.create(dto);

        return AgentResponse.builder()
                .action("CREATE_CHECKLIST")
                .result("Checklist '" + created.getTitle() + "' criada com id " + created.getId())
                .success(true)
                .build();
    }

    private AgentResponse handleAddItem(String prompt) {
        Long checklistId = extractNumber(prompt, new String[]{"checklist", "to checklist", "in checklist", "na checklist", "no checklist", "para checklist"});
        String itemDescription = extractQuotedText(prompt);

        if (itemDescription == null) {
            itemDescription = extractAfterKeyword(prompt, new String[]{"item", "item chamado", "item com nome"});
            if (itemDescription != null) {
                itemDescription = itemDescription.replaceAll("(?i)to checklist.*", "").trim();
                itemDescription = itemDescription.replaceAll("(?i)in checklist.*", "").trim();
                itemDescription = itemDescription.replaceAll("(?i)na checklist.*", "").trim();
                itemDescription = itemDescription.replaceAll("(?i)no checklist.*", "").trim();
            }
        }

        if (checklistId == null) {
            return AgentResponse.builder()
                    .action("ADD_ITEM")
                    .result("Nao consegui identificar o id da checklist. Exemplo: 'adicione o item \"Comprar leite\" na checklist 1'")
                    .success(false)
                    .build();
        }

        if (itemDescription == null || itemDescription.isEmpty()) {
            itemDescription = "Novo Item";
        }

        ItemDTO dto = ItemDTO.builder()
                .description(itemDescription)
                .completed(false)
                .build();
        ItemDTO created = itemService.create(checklistId, dto);

        return AgentResponse.builder()
                .action("ADD_ITEM")
                .result("Item '" + created.getDescription() + "' adicionado na checklist " + checklistId + " com id " + created.getId())
                .success(true)
                .build();
    }

    private AgentResponse handleToggleChecklist(String prompt) {
        Long checklistId = extractFirstNumber(prompt);

        if (checklistId == null) {
            return AgentResponse.builder()
                    .action("TOGGLE_CHECKLIST")
                    .result("Nao consegui identificar o id da checklist. Exemplo: 'conclua a checklist 1'")
                    .success(false)
                    .build();
        }

        ChecklistDTO toggled = checklistService.toggleComplete(checklistId);

        return AgentResponse.builder()
                .action("TOGGLE_CHECKLIST")
                .result("Checklist " + checklistId + " agora esta " + formatStatus(toggled.getStatus()))
                .success(true)
                .build();
    }

    private AgentResponse handleListChecklists() {
        List<ChecklistDTO> checklists = checklistService.findAll();

        if (checklists.isEmpty()) {
            return AgentResponse.builder()
                    .action("LIST_CHECKLISTS")
                    .result("Nenhuma checklist encontrada.")
                    .success(true)
                    .build();
        }

        StringBuilder sb = new StringBuilder("Encontrei " + checklists.size() + " checklist(s):\n");
        for (ChecklistDTO c : checklists) {
            sb.append("- [").append(c.getId()).append("] ")
              .append(c.getTitle())
              .append(" (").append(formatStatus(c.getStatus())).append(", ")
              .append(c.getItemCount()).append(" itens)\n");
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
                    .result("Nao consegui identificar o id da checklist. Exemplo: 'mostre os itens da checklist 1'")
                    .success(false)
                    .build();
        }

        List<ItemDTO> items = itemService.findByChecklistId(checklistId);

        if (items.isEmpty()) {
            return AgentResponse.builder()
                    .action("LIST_ITEMS")
                    .result("Nenhum item encontrado na checklist " + checklistId)
                    .success(true)
                    .build();
        }

        StringBuilder sb = new StringBuilder("Encontrei " + items.size() + " item(s) na checklist " + checklistId + ":\n");
        for (ItemDTO item : items) {
            sb.append("- [").append(item.getId()).append("] ")
              .append(item.getDescription())
              .append(" (").append(item.isCompleted() ? "concluido" : "pendente").append(")\n");
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
                    .result("Nao consegui identificar o id da checklist. Exemplo: 'apague a checklist 1'")
                    .success(false)
                    .build();
        }

        checklistService.delete(checklistId);

        return AgentResponse.builder()
                .action("DELETE_CHECKLIST")
                .result("Checklist " + checklistId + " removida")
                .success(true)
                .build();
    }

    private AgentResponse handleDeleteItem(String prompt) {
        Long itemId = extractFirstNumber(prompt);

        if (itemId == null) {
            return AgentResponse.builder()
                    .action("DELETE_ITEM")
                    .result("Nao consegui identificar o id do item. Exemplo: 'apague o item 1'")
                    .success(false)
                    .build();
        }

        itemService.delete(itemId);

        return AgentResponse.builder()
                .action("DELETE_ITEM")
                .result("Item " + itemId + " removido")
                .success(true)
                .build();
    }

    private boolean isChecklistCreationPrompt(String prompt) {
        return containsAny(prompt, "create", "new", "criar", "crie", "nova", "novo") && containsAny(prompt, "checklist", "lista");
    }

    private boolean isItemCreationPrompt(String prompt) {
        return containsAny(prompt, "add", "create", "criar", "adicionar", "adicione", "incluir", "inclua") && containsAny(prompt, "item", "tarefa");
    }

    private boolean isChecklistTogglePrompt(String prompt) {
        return containsAny(prompt, "mark", "toggle", "complete", "concluir", "conclua", "finalizar", "finalize", "reabrir", "reabra") && containsAny(prompt, "checklist", "lista");
    }

    private boolean isChecklistListPrompt(String prompt) {
        return containsAny(prompt, "list", "show", "listar", "liste", "mostrar", "mostre", "ver") && containsAny(prompt, "checklist", "checklists", "lista", "listas");
    }

    private boolean isItemListPrompt(String prompt) {
        return containsAny(prompt, "show", "list", "mostrar", "mostre", "listar", "liste", "ver") && containsAny(prompt, "item", "itens", "tarefa", "tarefas");
    }

    private boolean isChecklistDeletePrompt(String prompt) {
        return containsAny(prompt, "delete", "remove", "remover", "remova", "apagar", "apague", "excluir", "exclua") && containsAny(prompt, "checklist", "lista");
    }

    private boolean isItemDeletePrompt(String prompt) {
        return containsAny(prompt, "delete", "remove", "remover", "remova", "apagar", "apague", "excluir", "exclua") && containsAny(prompt, "item", "tarefa");
    }

    private boolean containsAny(String prompt, String... keywords) {
        for (String keyword : keywords) {
            if (prompt.contains(keyword)) {
                return true;
            }
        }
        return false;
    }

    private String normalize(String text) {
        return text.toLowerCase()
                .replace("á", "a")
                .replace("à", "a")
                .replace("ã", "a")
                .replace("â", "a")
                .replace("é", "e")
                .replace("ê", "e")
                .replace("í", "i")
                .replace("ó", "o")
                .replace("ô", "o")
                .replace("õ", "o")
                .replace("ú", "u")
                .replace("ç", "c")
                .trim();
    }

    private String formatStatus(com.checklist.module.checklist.ChecklistStatus status) {
        return switch (status) {
            case IN_PROGRESS -> "em andamento";
            case OVERDUE -> "vencida";
            case COMPLETED -> "concluida";
            case COMPLETED_LATE -> "concluida com atraso";
        };
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
