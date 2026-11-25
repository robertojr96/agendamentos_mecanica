# Kubernetes deployment

The manifests reference Kubernetes Secrets that are created outside the
repository. Do not commit credentials or JWT signing keys.

1. Create the namespace:

   ```sh
   kubectl apply -f infra/k8s/namespace.yaml
   ```

2. Create two local files, `infra/k8s/postgres.env` and
   `infra/k8s/backend.env`. Both paths are ignored by Git.

   `postgres.env`:

   ```dotenv
   POSTGRES_USER=<database user>
   POSTGRES_PASSWORD=<strong database password>
   POSTGRES_DB=<database name>
   ```

   `backend.env`:

   ```dotenv
   DATABASE_URL=postgresql://<user>:<password>@postgres.mecanica.svc.cluster.local:5432/<database>?schema=public
   JWT_SECRET=<output of openssl rand -base64 48>
   ```

   URL-encode any reserved characters in the database username or password
   used in `DATABASE_URL`. Restrict access to these files (for example,
   `chmod 600 infra/k8s/postgres.env infra/k8s/backend.env`).

3. Create the Secrets in the namespace:

   ```sh
   kubectl create secret generic postgres-secret \
     --namespace mecanica \
     --from-env-file=infra/k8s/postgres.env
   kubectl create secret generic backend-secret \
     --namespace mecanica \
     --from-env-file=infra/k8s/backend.env
   ```

4. Build both application images and make them available to your Kubernetes
   cluster. For a local cluster, use its image-loading command if it does not
   share the host Docker image store:

   ```sh
   docker build -t backend:local backend
   docker build -t frontend:local frontend
   ```

5. Apply PostgreSQL, wait for it to be ready, run migrations, then deploy the
   applications and ingress:

   ```sh
   kubectl apply -f infra/k8s/postgres.yaml
   kubectl rollout status statefulset/postgres -n mecanica
   kubectl delete job backend-migrations -n mecanica --ignore-not-found
   kubectl apply -f infra/k8s/migrations.yaml
   kubectl wait --for=condition=complete job/backend-migrations -n mecanica --timeout=120s
   kubectl apply -f infra/k8s/backend.yaml
   kubectl apply -f infra/k8s/frontend.yaml
   kubectl apply -f infra/k8s/ingress.yaml
   ```

Kubernetes runs the backend and the Vue app as separate containers: Nginx
serves the built frontend, while the Ingress forwards `/api` requests to NestJS.
For production, prefer a managed secret store and enable encryption of
Kubernetes Secrets at rest.
