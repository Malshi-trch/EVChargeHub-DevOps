# EVChargeHub - Electric Vehicle Charging Hub Service Platform

[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker&logoColor=white)](https://www.docker.com/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.4.1-6DB33F?logo=springboot&logoColor=white)](https://spring.io/projects/spring-boot)
[![Java](https://img.shields.io/badge/Java-21-ED8B00?logo=openjdk&logoColor=white)](https://openjdk.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-6-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-18-4169E1?logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Nginx](https://img.shields.io/badge/Nginx-Alpine-009639?logo=nginx&logoColor=white)](https://nginx.org/)

EVChargeHub is a cloud-native, containerized full-stack web application designed for electric vehicle drivers and charging station operators. It offers real-time station discovery, interactive map exploration, charging slot bookings, real-time availability tracking, vehicle management, and provider analytics.

---

## 🏛 System Architecture

The entire platform is orchestrated through Docker Compose with three decoupled, production-ready microservices running on an isolated virtual network (`evchargehub-network`):

```
                       +-----------------------------------+
                       |        Client Web Browser         |
                       +-----------------------------------+
                                   |           |
            Port 5173 (HTTP)       |           |  Port 8080 (Direct API optional)
                                   v           v
       +------------------------------------+  |
       |  evchargehub-frontend (Nginx)      |  |
       |  - Serves React 19 SPA (Vite)      |  |
       |  - Proxies /api/* requests --------+--+
       +------------------------------------+  |
                         |                     |
                         v (internal network)  |
       +------------------------------------+  |
       |  evchargehub-backend (Spring Boot) |<-+
       |  - Java 21 / Spring Boot 3.4.1     |
       |  - JWT Authentication & RBAC       |
       |  - Station & Booking REST APIs     |
       +------------------------------------+
                         |
                         v (internal network: postgres:5432)
       +------------------------------------+
       |  evchargehub-postgres (Alpine)     |
       |  - PostgreSQL 18                   |
       |  - Named Volume: postgres_data     |
       |  - Host Port: 5433 (no collision)  |
       +------------------------------------+
```

### Services Summary

| Service | Technology | Internal Port | Host Port | Description |
| :--- | :--- | :--- | :--- | :--- |
| **`frontend`** | React 19, Vite, Leaflet, Nginx Alpine | `80` | `5173` | Responsive web client and reverse proxy for `/api/` |
| **`backend`** | Spring Boot 3.4.1, Java 21, JPA/Hibernate | `8080` | `8080` | REST API, JWT auth, business logic, auto-migration |
| **`postgres`** | PostgreSQL 18 Alpine | `5432` | `5433` | Relational database with persistent volume |

> **Note on Port 5433:** PostgreSQL is mapped to host port `5433` specifically to avoid port collisions with any local PostgreSQL instance already running on the standard port `5432`.

---

## 🚀 Quick Start Guide (Standard & University Lab Computers)

Follow these steps to clone, configure, build, and run EVChargeHub on any computer with Docker Desktop.

### Prerequisites

- **Git** (2.30 or higher)
- **Docker Desktop** (with Docker Compose v2)
  - Ensure Docker Desktop is running before executing commands.
  - On Windows, verify WSL 2 backend is enabled.

---

### Step 1: Clone the Repository

```bash
git clone https://github.com/Malshi-trch/EVChargeHub-DevOps.git
cd EVChargeHub-DevOps
```

---

### Step 2: Configure Environment Variables

Create your local `.env` configuration file by copying the provided `.env.example` template:

**Windows (PowerShell):**
```powershell
Copy-Item .env.example .env
```

**macOS / Linux:**
```bash
cp .env.example .env
```

Open `.env` in any text editor and supply your own secure passwords:
- `DB_PASSWORD`: Set a secure database password (e.g. `StrongDbPass2026!`).
- `JWT_SECRET`: Set a secure secret key at least 32 characters long (e.g. `YourSuperSecretJwtKeyMustBeAtLeast32CharsLong!`).

> **Security Warning:** The `.env` file is excluded in `.gitignore` and must **never** be committed to version control.

---

### Step 3: Build and Start Containers

Run Docker Compose to build the application images and start the services in detached mode:

```bash
docker compose up -d --build
```

Docker will automatically:
1. Initialize the PostgreSQL 18 database with the persistent volume `postgres_data`.
2. Compile the Spring Boot backend using a multi-stage Java 21 build.
3. Wait for PostgreSQL to pass its health check before starting the backend.
4. Build the React frontend with Vite and serve it via Nginx.
5. Wait for the backend health check to pass before starting the frontend.

---

### Step 4: Verify Container Health

Check the status of running containers:

```bash
docker compose ps
```

All three services should report `Up` with `healthy` status:

```
NAME                    IMAGE                     COMMAND                  SERVICE    STATUS
evchargehub-backend     evchargehub-backend:1.0   "java -jar app.jar"      backend    Up (healthy)
evchargehub-frontend    evchargehub-frontend:1.0  "/docker-entrypoint.…"   frontend   Up
evchargehub-postgres    postgres:18-alpine        "docker-entrypoint.s…"   postgres   Up (healthy)
```

---

### Step 5: Access the Application

Open your browser and navigate to:

- **Frontend Application:** [http://localhost:5173](http://localhost:5173)
- **Backend API Stations:** [http://localhost:8080/api/stations](http://localhost:8080/api/stations)
- **PostgreSQL Connection (Host):** `localhost:5433` (Database: `evchargehub`, User: `postgres`)

---

## 🧪 Testing and Inspection

### Viewing Service Logs

To monitor container output or diagnose issues:

```bash
# View combined logs
docker compose logs -f

# View backend logs only
docker compose logs -f backend

# View database logs only
docker compose logs -f postgres

# View frontend logs only
docker compose logs -f frontend
```

### Stopping the Services

```bash
# Gracefully stop containers (preserves database data)
docker compose down

# Stop containers and remove volumes (resets database to clean state)
docker compose down -v
```

---

## 🏫 Special Instructions for University Lab Computers

University lab environments frequently have strict network policies, shared host ports, and pre-existing software. Keep these tips in mind:

1. **Port Collisions:**
   - **Port 5173 in use:** If a Vite dev server or other student project is occupying `5173`, change `FRONTEND_PORT=5174` in `.env` and run `docker compose up -d`.
   - **Port 8080 in use:** Change `BACKEND_PORT=8081` in `.env`.
   - **PostgreSQL (5432):** EVChargeHub uses `5433` on the host, so it will not collide with pre-installed PostgreSQL instances.
2. **Docker Desktop Permissions:**
   - On Windows lab workstations, ensure your account belongs to the `docker-users` group or run Docker Desktop as Administrator.
3. **Low Memory Workstations:**
   - Allocate at least 4 GB of RAM to Docker Desktop (Settings -> Resources) for smooth Maven build execution.
4. **Proxy & VPN Settings:**
   - If behind a university corporate proxy, configure the HTTP proxy in Docker Desktop settings.

---

## 📂 Project Repository Structure

```
EVChargeHub-DevOps/
├── .env.example             # Template for required environment variables
├── .gitignore               # Excludes secrets, node_modules, build artifacts
├── docker-compose.yml       # Production multi-container orchestration
├── README.md                # Project documentation and deployment guide
│
├── database/
│   └── init.sql             # PostgreSQL initialization script
│
├── backend/
│   ├── Dockerfile           # Multi-stage Java 21 build & Temurin runtime
│   ├── .dockerignore        # Optimizes Docker build context
│   ├── pom.xml              # Maven dependencies (Spring Boot 3.4.1)
│   ├── mvnw / mvnw.cmd      # Maven wrappers (Linux/macOS & Windows)
│   └── src/                 # Spring Boot source code (REST controllers, entities, JWT security)
│
└── frontend/
    ├── Dockerfile           # Multi-stage Node 20 build & Nginx runtime
    ├── .dockerignore        # Optimizes Docker build context
    ├── nginx.conf           # Reverse proxy configuration for /api/ & SPA routing
    ├── package.json         # React 19, Vite, Leaflet dependencies
    ├── vite.config.js       # Vite build configuration
    └── src/                 # React UI components, pages, services, styling
```

---

## 🔒 Security Policy

- **No Hardcoded Credentials:** All credentials and secrets are supplied strictly via environment variables.
- **Protected Environment Files:** `.env` is ignored by Git and never uploaded to any remote repository.
- **Role-Based Access Control (RBAC):** Backend endpoints are secured using Spring Security and stateless JWT token authentication with separated roles: `ROLE_USER` and `ROLE_STATION_PROVIDER`.
- **Database Non-Exposure:** The database service is confined to an internal virtual network, accessible externally only through specified, protected host mappings.

---

## 👥 Contributors & Maintainers

- **EC5207 DevOps Engineering Team**
