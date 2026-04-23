# Student Grievance Portal

## 1. Project Title & Overview
**Student Grievance Portal** is a full-stack web application designed to facilitate transparent communication between students and university or institutional administrators. 

### What it solves
In many academic environments, students struggle with tracking the status of their complaints, issues, or requests (grievances), while administrators often lack a centralized dashboard to triage, prioritize, and communicate resolutions effectively. 

### Why this project exists
This project replaces fragmented email threads and manual ticketing systems with a dedicated, role-based dashboard. It provides a real-time tracking interface for students and a priority-driven management queue for administrators to resolve campus concerns quickly.

---

## 2. Key Features
* **Role-Based Workflows:** Distinct UI and access for `STUDENT` and `ADMIN` accounts.
* **Grievance Submission:** Students can submit concerns securely, including title, description, and perceived priority.
* **Triage & Priority Control:** Administrators evaluate incoming tickets and can formally override the priority scale (LOW, MEDIUM, HIGH, URGENT).
* **State Machine Tracking:** Grievances follow a strict lifecycle `OPEN` ➔ `IN_PROGRESS` ➔ `RESOLVED` (or `REJECTED`).
* **Transparent Feedback:** Administrators can append internal notes for tracking or attach specific public feedback when rejecting a grievance.
* **Dynamic Design System:** The React frontend includes built-in Light/Dark mode theming decoupled from the OS preference, providing a modern layout using robust custom CSS overrides.

---

## 3. Tech Stack

### Frontend
* **Core:** React 18, HTML5, Vanilla custom CSS.
* **Routing:** React Router v6.
* **Tooling:** Vite (for rapid development and bundling).
* **State Management:** React Context API (for theming) and LocalStorage (for implicit session handling).

### Backend
* **Core:** Java 17+, Spring Boot 3.x.
* **Web:** Spring Web (MVC) for REST APIs.
* **Data Access:** Spring Data JPA / Hibernate.
* **Validation:** Jakarta Validation API.

### Database
* **Type:** Relational SQL Database.
* **Primary System:** PostgreSQL 14+ is the targeted production database.
* **Fallback / Local:** Configured to dynamically support H2 in-memory databases for local development if PostgreSQL is unavailable.

---

## 4. Architecture Overview
This project relies on a classic **Client-Server Architecture**:
1. **Client Layer (React SPA):** Handles all visual rendering and user state. The frontend communicates with the backend exclusively via asynchronous `fetch` calls wrapper in `api.js`.
2. **Network Layer:** Cross-Origin Resource Sharing (CORS) is configured explicitly in the backend to trust the frontend environments (`localhost:5173`).
3. **Application Layer (Spring Boot API):** A strictly stateless set of REST controllers exposing JSON endpoints. The controllers validate incoming DTOs (Data Transfer Objects), perform business logic, and delegate storage to the Repository layer.
4. **Data Layer (PostgreSQL/H2):** Handles persistent storage of relational entity boundaries using Hibernate auto-generation schema functionality.

---

## 5. Project Structure

```text
student-grievance-portal/
├── backend/                             # Java Spring Boot Backend
│   ├── pom.xml                          # Maven Dependency Configuration
│   └── src/main/
│       ├── java/com/studentgrievance/portal/
│       │   ├── config/                  # Server level config (CORS, Bootstrapping)
│       │   ├── controller/              # Defines REST API Routes & Logic
│       │   ├── dto/                     # Plain data models isolated from Entites
│       │   ├── model/                   # JPA Entity definitions (User, Grievance, Roles)
│       │   └── repository/              # Spring Data JPA DB Queries
│       └── resources/
│           └── application.properties   # DB Credentials and System Settings
│
├── frontend/                            # React Vite Frontend
│   ├── package.json                     # NPM Scripts and package definitions
│   ├── vite.config.js                   # Vite tooling configuration
│   └── src/                             # Core UI codebase
│       ├── api.js                       # Centralized endpoint fetch wrappers
│       ├── App.jsx                      # App root, Route configuration
│       ├── styles.css                   # Global and themed stylesheet
│       ├── context/                     # Context providers (ThemeContext)
│       └── pages/                       # View components (Admin, Student, Login)
└── README.md
```

---

## 6. Database Design & Data Management
The system utilizes a **Relational SQL Architecture** because the data is highly structured with clear mapping restrictions.

### Collections / Entities
1. **`User` Table:** Stores identity configurations.
   * *Fields:* `id, email, full_name, password, role (STUDENT | ADMIN)`
2. **`Grievance` Table:** Stores the actual complaints.
   * *Fields:* `id, title, description, status, priority, created_at, rejection_feedback, admin_comments, student_id`

### Relationships
* **One-to-Many (`User` ➔ `Grievance`):** A student can submit infinitely many grievances, but a single grievance is fundamentally owned by exactly one student (`student_id` acts as the foreign key). 

---

## 7. Installation & Setup

### Prerequisites
* Java 17+ and Maven 3.9+
* Node.js 18+ and NPM
* (Optional) PostgreSQL 14+ installed and running on port `5432`

### Backend Setup
1. Open up the directory in your terminal:
   ```bash
   cd backend
   ```
2. Set up the database properties inside `backend/src/main/resources/application.properties`. If you prefer to run things fully locally without a Postgres install, you can retain the default **H2 embedded database** config inside the file.
3. Start the Spring Boot application:
   ```bash
   mvn clean spring-boot:run
   ```
*(The backend server will run continuously on `http://localhost:8080`)*

### Frontend Setup
1. Open a new terminal tab and navigate to the frontend:
   ```bash
   cd frontend
   ```
2. Install the necessary NPM dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
*(The React application will be available at `http://localhost:5173`)*

---

## 8. Usage Guide

### Initial Bootstrapping
When the backend first starts, a `DataSeeder` script executes. It scans the database to verify if an Administrator exists. If none are found, it generates a default admin account:
* **Email:** `admin@portal.com`
* **Password:** `admin123`

### Workflows
* **Registering:** Navigate to `localhost:5173/register` to create a new student account. You will automatically be assigned the `STUDENT` role.
* **Filing a Grievance:** Log in as your newly created student. Fill out the "Submit Grievance" form with a summary, description, and your evaluated priority.
* **Resolving an Issue:** Log out and log back in using the Admin credentials highlighted above. You can view all incoming grievances globally, filter them by status/priority, and change their state to `RESOLVED` or append `internal notes`.

---

## 9. API Documentation

### Core Endpoints
| HTTP Method | Endpoint | Request Body | Description |
|---|---|---|---|
| POST | `/api/auth/register` | `{ fullName, email, password }` | Registers a new student and returns user Identity. |
| POST | `/api/auth/login` | `{ email, password }` | Authenticates User and validates role routing. |
| POST | `/api/grievances` | `{ studentId, title, description, priority }` | Creates a new Grievance ticket bound to a user. |
| GET | `/api/grievances/mine?studentId={id}` | - | Retrieves a list of grievances owned by a specific student ID. |
| GET | `/api/grievances/all` | - | Admin Route: Returns a comprehensive array of all global system grievances. |
| PUT | `/api/grievances/{id}/status?status={STATUS}` | - | Admin Route: Force updates the state machine of a ticket. |
| PUT | `/api/grievances/{id}/reject` | `{ feedback }` | Rejects a ticket and attaches the rejection reason. |

---

## 10. Design Decisions

* **DTO Pattern:** The backend physically separates the `User` / `Grievance` database Entities from the JSON requests returned to the React Client logic (`AuthDtos`, `GrievanceDtos`). This allows the database schema to change safely without necessarily breaking frontend API implementations.
* **Separation of Concerns:** The React code delegates generic `fetch` configurations strictly to the `api.js` file, ensuring components only define UI-oriented behaviors rather than muddy HTTP protocols.
* **Local Storage Auth:** For rapid prototyping, Identity persistence utilizes generic non-expiring HTML localStorage flags rather than intensive Cookie/Session architectures.

---

## 11. Limitations & Future Improvements

This codebase acts as an academic or prototyping foundation. To deploy it in a real production environment, the following structural limitations **must** be remediated:

### Security Vulnerabilities 🚨
* **Plaintext Passwords:** Passwords are mathematically uncrypted and stored as raw text (`User.password`) in PostgreSQL. *Must implement `BCryptPasswordEncoder` globally.*
* **Unprotected Service Endpoints:** The API expects the client to self-report their `studentId` and does not rely on a verifiable Session or JWT Token. A malicious client can trivially bypass the UI and make direct requests.

### Future Enhancements
* **Proper Admin Comments Modeling:** Administrator comments are currently appended together inside a massive concatenated database-string field (`g.setAdminComments(...)`). This should be separated into a distinct `Comment` Entity utilizing a `OneToMany` relational table map block.
* **Pagination & Loading Limits:** `getAllGrievances` pulls the entire database into memory blindly. Adding `Pageable` parameters to JPA requests will vastly improve response times as data scales.
* **Global Error Dealing:** Uncaptured logic errors trigger verbose standard Java stack-traces in JSON responses. Needs a `@ControllerAdvice` blanket handler wrapper explicitly for mapping HTTP 4xx and 5xx.

---

## 12. Contributing
Contributions are welcomed and deeply appreciated!
1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 13. License
Distributed under the MIT License.
