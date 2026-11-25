# Frontend

Aplicação Vue 3 para autenticar usuários e gerenciar os agendamentos da oficina.
O frontend chama a API pela rota `/api`; em desenvolvimento, o Vite encaminha
essas requisições para `http://localhost:3000`.

```sh
npm ci
npm run dev
```

Para criar uma imagem que serve a aplicação compilada pelo Nginx:

```sh
docker build -t frontend:local .
```
