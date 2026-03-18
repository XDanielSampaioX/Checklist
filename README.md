# ✅ Checklist Manager — AI-Powered Full Stack

Um gerenciador de checklists full stack com arquitetura modular, desenvolvido com **Java Spring Boot** (backend) e **Next.js 14** (frontend), gerenciado por **agentes de IA** via prompts em linguagem natural.

---

## 🏗️ Arquitetura

```
Checklist/
├── backend/          # Java 17 + Spring Boot 3.2 (API REST modular)
│   └── src/main/java/com/checklist/
│       ├── module/
│       │   ├── checklist/    # CRUD de checklists
│       │   ├── item/         # CRUD de itens
│       │   └── agent/        # Integração com agentes de IA
│       ├── config/           # CORS, etc.
│       └── exception/        # Tratamento global de erros
├── frontend/         # Next.js 14 + TypeScript + Tailwind CSS
│   └── src/
│       ├── app/              # App Router (Next.js)
│       ├── components/       # Componentes React
│       └── lib/api.ts        # Client HTTP para o backend
└── docker-compose.yml
```

---

## 🚀 Como Executar

### Pré-requisitos
- Java 17+
- Maven 3.8+
- Node.js 18+
- npm 9+

### Backend (Spring Boot)
```bash
cd backend
mvn spring-boot:run
```
API disponível em: `http://localhost:8080`  
Swagger UI: `http://localhost:8080/swagger-ui.html`  
H2 Console: `http://localhost:8080/h2-console`

### Frontend (Next.js)
```bash
cd frontend
npm install
npm run dev
```
App disponível em: `http://localhost:3000`

### Docker Compose (ambos juntos)
```bash
docker-compose up --build
```

---

## 🤖 Agente de IA — Comandos por Prompt

O sistema inclui um agente de IA que aceita comandos em linguagem natural. Use a interface web ou a API diretamente:

### Via Interface Web
Acesse `http://localhost:3000` e use o painel **AI Agent** para digitar comandos.

### Via API
```bash
curl -X POST http://localhost:8080/api/agent/execute \
  -H "Content-Type: application/json" \
  -d '{"prompt": "create a checklist called Shopping List"}'
```

### Exemplos de Prompts Suportados

| Prompt | Ação |
|--------|------|
| `create a checklist called 'Shopping List'` | Cria um novo checklist |
| `list all checklists` | Lista todos os checklists |
| `add item 'Buy milk' to checklist 1` | Adiciona item ao checklist |
| `mark checklist 1 as complete` | Marca checklist como concluído |
| `show items in checklist 1` | Lista itens do checklist |
| `delete checklist 1` | Remove o checklist |

---

## 📡 API REST

### Checklists
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/checklists` | Listar todos |
| GET | `/api/checklists/{id}` | Buscar por ID |
| POST | `/api/checklists` | Criar |
| PUT | `/api/checklists/{id}` | Atualizar |
| DELETE | `/api/checklists/{id}` | Remover |
| PATCH | `/api/checklists/{id}/toggle` | Alternar status |

### Itens
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/checklists/{id}/items` | Listar itens |
| POST | `/api/checklists/{id}/items` | Criar item |
| PUT | `/api/checklists/{id}/items/{itemId}` | Atualizar item |
| DELETE | `/api/checklists/{id}/items/{itemId}` | Remover item |
| PATCH | `/api/checklists/{id}/items/{itemId}/toggle` | Alternar status |

### Agente IA
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/api/agent/execute` | Executar comando |

---

## 🛠️ Tecnologias

### Backend
- Java 17
- Spring Boot 3.2
- Spring Data JPA
- H2 Database (em memória)
- Lombok
- SpringDoc OpenAPI (Swagger)

### Frontend
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- React 18
