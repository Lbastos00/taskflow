# TaskFlow — Sistema Web de Gerenciamento de Tarefas

Projeto acadêmico para a disciplina **Desenvolvimento Web Front-End**, professor **Dângelo Silva Miranda**, Universidade FUMEC.

**Integrantes:** Lucas Bastos Lustosa e Giovana Azevedo.

## Como executar

1. Instale **Python 3.9 ou superior** (nenhuma biblioteca extra é necessária).
2. Abra um terminal na pasta do projeto.
3. Execute `python server.py` (no Windows, `py server.py` também pode funcionar).
4. Abra **http://127.0.0.1:8000** no navegador.

Na primeira execução o servidor cria automaticamente `taskflow.db` com dados demonstrativos. Para reiniciar os dados, pare o servidor, exclua `taskflow.db` e execute novamente.

## Contas demonstrativas

| Perfil | E-mail | Senha |
|---|---|---|
| Administrador (Lucas) | lucas@taskflow.local | Demo@2026 |
| Membro (Giovana) | giovana@taskflow.local | Demo@2026 |

**Aviso:** essas credenciais são *exclusivamente fictícias* e destinadas à demonstração local; não devem ser usadas em serviços reais.

## Funcionalidades disponíveis

- Login, logout e verificação de sessão por token no servidor;
- Restrição de rotas e permissões entre administrador e membro;
- Listagem, busca e filtro de tarefas;
- Detalhes, cadastro, alteração e exclusão de tarefas;
- Validação de campos e responsável;
- Dashboard com totais, status, prioridade, progresso e prazos;
- Administração e cadastro de usuários pelo perfil administrador;
- Consumo de API REST `/api/*` usando Fetch e SQLite;
- Lazy loading dos módulos das telas por `import()`;
- Layout responsivo para computador e celular.

## Telas

1. Login (`#/login`);
2. Dashboard (`#/dashboard`);
3. Listagem de tarefas (`#/tarefas`);
4. Cadastro/edição de tarefas (`#/tarefas/nova`, `#/tarefas/:id/editar`);
5. Detalhes da tarefa (`#/tarefas/:id`);
6. Administração de usuários (`#/usuarios`, acesso restrito ao administrador).

## Organização de arquivos

```text
TaskFlow_Projeto/
├── index.html
├── server.py
├── assets/
│   ├── css/styles.css
│   └── js/
│       ├── app.js          (rotas protegidas e lazy loading)
│       ├── api.js          (consumo da API)
│       ├── utils.js
│       └── views/          (módulos das seis telas)
└── README.md
```

## API REST

| Método | Rota | Finalidade |
|---|---|---|
| POST | `/api/login` | Autenticar usuário |
| GET | `/api/me` | Consultar sessão |
| POST | `/api/logout` | Finalizar sessão |
| GET | `/api/tasks` | Listar tarefas |
| POST | `/api/tasks` | Cadastrar tarefa |
| GET | `/api/tasks/:id` | Exibir detalhes |
| PUT | `/api/tasks/:id` | Editar tarefa |
| DELETE | `/api/tasks/:id` | Excluir tarefa |
| GET | `/api/users` | Listar usuários |
| POST | `/api/users` | Criar usuário (admin) |

**Controle de acesso:** membros podem cadastrar tarefas para si e editar/excluir apenas as próprias tarefas. Administradores podem gerenciar todas as tarefas e criar usuários.

## Versionamento

O desenvolvimento utiliza Git e GitHub, com as branches `main`, `develop` e branches de funcionalidades `feature/*`, seguindo GitFlow. Mensagens de commit seguem Conventional Commits (`feat:`, `fix:`, `docs:`, `refactor:` e `test:`).

## Escopo e limitações

O aplicativo é um **protótipo acadêmico executável localmente**, não uma solução de produção. O servidor usa uma lista de sessões em memória, credenciais demonstrativas e banco SQLite local. Não publicar esse serviço na internet sem medidas adicionais de segurança, testes e configuração. Os módulos JavaScript são carregados sob demanda; o cache de fontes externas pode depender de internet, mas a aplicação funciona com fontes de fallback.
