# FinFlow – Personal Finance Management

## Short Description

Many individuals struggle to maintain awareness of their daily spending, leading to poor financial decisions and unmet savings goals. **FinFlow** was built to address this problem by providing a unified platform for personal finance management, targeting university students and young professionals who need a simple yet powerful tool to track income, expenses, budgets, and savings goals. 

The final product is a full-stack web application featuring interactive dashboards, visual reports, Excel import/export, and a "Hybrid" AI-powered chatbot (Google Gemini + Offline Regex Fallback) that delivers personalized financial advice and automates data entry. The system is deployed live with secure authentication.

---

## Member List

| No. | Full Name | Student ID | Main Responsibility |
|-----|-----------|------------|---------------------|
| 1   | Nguyễn Trịnh Võ | 2301040201| Fullstack Developer (FE, BE, AI, Deployment) |
| 2   | Lương Việt Anh | 2301040004 | System Analysis & Documentation (SRS, ERD) |
| 3   | Nguyễn Cao Phong | 2301040146 | UI/UX Design & Presentation (Figma, Slides) |



---

## Tech Stack

### Frontend
| Technology | Version | Purpose |
|---|---|---|
| React | 19 | UI Framework |
| Vite | 8 | Build tool & dev server |
| Tailwind CSS | v4 | Utility-first styling |
| React Router DOM | v7 | Client-side routing |
| Recharts | v3 | Interactive charts |
| Axios | v1 | HTTP client |
| Lucide React | v1 | Icon library |
| React Markdown | v10 | Render AI chat responses |
| XLSX | v0.18 | Excel import/export |
| React Hot Toast | v2 | Toast notifications |

### Backend
| Technology | Version | Purpose |
|---|---|---|
| Spring Boot | 4.0.4 | Application framework |
| Java | 21 | Programming language |
| Spring Security | — | Authentication & authorization (BCrypt) |
| Spring Data JPA | — | ORM / database access |
| MySQL (TiDB Cloud) | — | Relational cloud database |
| Google Gen AI SDK | 1.46.0 | Gemini AI integration |
| Cloudinary | 2.0.0 | Cloud image/file storage |
| Lombok | — | Boilerplate reduction |
| dotenv-java | 3.1.0 | `.env` file loading |

### Infrastructure
| Tool | Purpose |
|---|---|
| Docker & Docker Compose | Containerized deployment on VPS |
| Maven Wrapper (`mvnw`) | Dependency management & build |
| Vercel | Secondary frontend hosting |
| Nginx | Reverse proxy for VPS deployment |

---

## Main Features

- **Account Management** – Create and manage multiple financial accounts (bank, cash, e-wallet, etc.)
- **Transaction Tracking** – Log income and expense transactions with categories, dates, and notes
- **Visual Reports** – Analyze spending and income with interactive pie charts and bar charts
- **Savings Goals** – Set financial goals and track progress towards them
- **Budget Management** – Define monthly budgets per category and monitor usage
- **Category Management** – Customize income and expense categories
- **Hybrid AI Financial Chatbot** – Chat with Gemini AI for advice, or use offline commands to automate transaction logging (even when the API hits rate limits).
- **Secure Authentication** – Register/Login with email-password, and basic forgot password support.
- **Profile & Avatar** – Update user profile and upload avatar via Cloudinary
- **Excel Export/Import** – Export transactions to `.xlsx` and import bulk data
- **Responsive UI** – Mobile-friendly interface with dark mode support

---

## Overall Project Structure

```text
personal-finance-manangement/
├── BE/                                   # Backend – Spring Boot
│   ├── src/main/java/com/example/FinFlow/
│   │   ├── config/               # Security (CORS), App config
│   │   ├── controller/           # REST APIs (Auth, Chatbot, Transactions...)
│   │   ├── dto/                  # Request/Response DTOs
│   │   ├── model/                # JPA Entities (User, Account, Category...)
│   │   ├── repository/           # Spring Data JPA repositories
│   │   └── service/              # Business logic (e.g., ChatbotService with Offline Fallback)
│   ├── Dockerfile
│   ├── pom.xml
│   ├── mvnw / mvnw.cmd
│   └── .env                              # Backend environment variables
│
├── FE/                                   # Frontend – React + Vite
│   ├── src/
│   │   ├── components/                   # Charts, AI Chat, UI elements
│   │   ├── pages/                        # Auth & Dashboard views
│   │   └── utils/                        # Axios instance, helpers
│   ├── Dockerfile
│   ├── package.json
│   ├── vite.config.js
│   └── .env                              # Frontend environment variables
│
├── docker-compose.yml                    # Orchestrate BE + FE containers for VPS
└── README.md
```

---

## Installation – Required Tools

Make sure the following are installed before running the project:

| Tool | Version | Download |
|---|---|---|
| Node.js | ≥ 18 | https://nodejs.org |
| JDK (Java) | 21 | https://adoptium.net |
| Docker & Docker Compose | Latest | https://www.docker.com (optional) |
| Git | Any | https://git-scm.com |

> Maven is **not required** globally — the project includes `mvnw` / `mvnw.cmd` wrappers.

---

## Environment Variable Setup using `.env.example`

### Backend — `BE/.env`

Create a file at `BE/.env` with the following content:

```env
# ──────────────────────────────────────────────
# Google Gemini AI
# ──────────────────────────────────────────────
GEMINI_API_KEY=your_gemini_api_key_here

# ──────────────────────────────────────────────
# Cloudinary (image/file storage)
# ──────────────────────────────────────────────
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# ──────────────────────────────────────────────
# Database — TiDB Cloud
# ──────────────────────────────────────────────
SPRING_DATASOURCE_URL=jdbc:mysql://<gateway>:<port>/FinFlow?createDatabaseIfNotExist=true&useSSL=true&allowPublicKeyRetrieval=true&serverTimezone=UTC
SPRING_DATASOURCE_USERNAME=your_db_username
SPRING_DATASOURCE_PASSWORD=your_db_password
```

### Frontend — `FE/.env`

Create a file at `FE/.env` with the following content:

```env
# API base URL — point to your running backend
VITE_API_BASE_URL=http://localhost:8080
```

---

## Database Setup / Migration / Seeding

FinFlow uses **Spring Data JPA** with `hibernate.ddl-auto=update`.

- On first startup, the backend **automatically creates** the `FinFlow` database and **generates all required tables** from JPA entity classes.
- **No manual SQL scripts** are needed for schema setup.
- There is **no seed data** by default — use the application UI or Register to create your first user account.

---

## How to Run Frontend

```bash
# 1. Navigate to the frontend directory
cd FE

# 2. Install dependencies
npm install

# 3. Start the development server
npm run dev
```

The frontend will be available at: `http://localhost:3000`

---

## How to Run Backend

```bash
# 1. Navigate to the backend directory
cd BE

# 2. Make sure BE/.env is configured (see above)

# 3. Run using Maven Wrapper (Linux/macOS)
./mvnw spring-boot:run

# 3. Run using Maven Wrapper (Windows)
mvnw.cmd spring-boot:run
```

The backend API will be available at: `http://localhost:8080`

---

## How to Run the Full System from a Clean Machine

### Option A – Manual (Recommended for development)

1. Clone the repository: `git clone <repository-url>`
2. Set up environment files (`BE/.env` and `FE/.env`).
3. Open two terminal windows:
   - **Terminal 1 (Backend):** `cd BE` -> `./mvnw spring-boot:run`
   - **Terminal 2 (Frontend):** `cd FE` -> `npm install` -> `npm run dev`

### Option B – Docker Compose (for quick setup / production-like)

1. Clone the repository.
2. Create the root `.env` file (copy from `.env.example` if available, or populate with actual credentials).
3. Build and start all services:
   ```bash
   docker-compose up -d --build
   ```

| Service | URL |
|---|---|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:8080 |

To stop: `docker-compose down`

---

## Demo Account

The application is **live** and publicly accessible.

| | |
|---|---|
| **Live URL** | https://fifl.me/ |
| **Vercel Mirror** | https://ss-2-final-personal-finance-managem.vercel.app/ |
| **Test account** | `testaccount` / `123123` |

> Alternatively, click **"Try live demo"** on the landing page or use **Register** to create a free account.

---

## Known Issues & Limitations

- **API Cold Starts** — The free-tier TiDB Cloud and Gemini AI API often enter "sleep mode". The first request of a session may take 3–8 seconds.
- **Forgot Password Security** — The current "Forgot Password" feature resets passwords directly via API without email/OTP verification, posing a security risk.
- **Lack of CI/CD pipeline** — Deployments are currently manual; the project lacks automated unit testing (e.g., JUnit/Jest) via GitHub Actions.
- **Excel import validation** — Importing `.xlsx` files with unexpected column formats may silently skip invalid rows. Ensure the file matches the exported template.
