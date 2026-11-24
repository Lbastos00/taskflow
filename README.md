# TaskFlow — Trabalho final de Desenvolvimento Web Front-End

**Universidade FUMEC — Ciência da Computação**  
**Integrantes:** Lucas Bastos e Giovana Azevedo

Projeto Angular com Dashboard, Kanban, listagem, pesquisa, cadastro, edição e exclusão de tarefas. Esta versão implementa **HttpClient**, **services**, **JSON-Server** como Web API e armazenamento em `db.json`, além de **Reactive Forms com Validators**.

## Pré-requisitos
- Node.js 20.19+ ou 22.12+ (recomendado Node.js 22 LTS), com npm.
- Não é necessário instalar o Angular CLI globalmente.

## Como executar (Windows / PowerShell)
Abra um terminal na pasta que contém `package.json` e execute:

```powershell
npm.cmd install
npm.cmd run dev
```

Acesse **http://localhost:4200**. O comando `dev` inicia **Angular (4200)** e **JSON-Server (3000)**. Deixe o terminal aberto. Se a unidade de rede causar erro de watcher, use dois terminais:

Terminal 1: `npm.cmd run api`  
Terminal 2: `npm.cmd start -- --poll=2000`

## API
- `GET http://localhost:3000/tarefas` — lista
- `GET http://localhost:3000/tarefas/:id` — consulta
- `GET http://localhost:3000/tarefas?q=texto` — pesquisa (JSON-Server)
- `POST http://localhost:3000/tarefas` — cadastro
- `PUT http://localhost:3000/tarefas/:id` — edição
- `PATCH http://localhost:3000/tarefas/:id` — status
- `DELETE http://localhost:3000/tarefas/:id` — exclusão

Os dados ficam salvos no arquivo **db.json** e persistem ao reiniciar. IDs são strings conforme JSON-Server v1.

## Arquitetura
- `src/app/pages/` — páginas Angular standalone.
- `src/app/services/tarefa.service.ts` — regras de acesso à API por HttpClient.
- `src/app/models/tarefa.model.ts` — tipos de tarefa.
- `src/app/app.routes.ts` — navegação.
- `src/app/app.config.ts` — providers do roteador e HttpClient.
- `db.json` — banco de dados de demonstração.

## Observações
- O login é **demonstrativo**, sem autenticação de servidor.
- O JSON-Server é uma API local para fins acadêmicos; não é adequado a produção sem controles de acesso.
- Para publicação no GitHub, envie os arquivos da pasta do projeto **sem `node_modules`, `.angular` e `dist`**.
- Após instalar as dependências, execute `npm.cmd run build` para conferir a compilação.
