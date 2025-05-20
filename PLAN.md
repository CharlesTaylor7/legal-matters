# PLAN.md: Customer & Matter Management System

This document outlines the step-by-step implementation plan for the Customer & Matter Management System.

## Phase 1: Project Setup & Foundation

1.  **Initialize Project using `create-t3-app`**:
    *   Run `npx create-t3-app@latest your-project-name`
    *   Select the following options during setup:
        *   Next.js
        *   TypeScript
        *   Tailwind CSS
        *   Prisma
        *   NextAuth.js (for authentication, can be configured for JWT)
        *   tRPC (optional, but `create-t3-app` includes it. You can still create standard Next.js API routes as per instructions).
    *   This will set up a basic Next.js application with TypeScript, Tailwind, and Prisma configured.

2.  **Configure ESLint & Prettier**:
    *   `create-t3-app` usually sets these up. Review configurations and ensure they meet project standards.

3.  **Set up Docker for PostgreSQL**:
    *   Create a `docker-compose.yml` file to define a PostgreSQL service.
    *   Example `docker-compose.yml`:
        ```yaml
        version: '3.8'
        services:
          db:
            image: postgres:15 # Or your preferred version
            restart: always
            environment:
              POSTGRES_USER: your_db_user
              POSTGRES_PASSWORD: your_db_password
              POSTGRES_DB: your_db_name
            ports:
              - "5432:5432"
            volumes:
              - postgres_data:/var/lib/postgresql/data
        volumes:
          postgres_data:
        ```
    *   Create a `.env` file based on `.env.example` (which you'll create later) to store database credentials and update your Prisma schema's `datasource db { ... }` block to use these environment variables.
    *   Run `docker-compose up -d` to start the PostgreSQL container.

## Phase 2: Database Schema & Backend API

4.  **Define Prisma Schema**:
    *   Open `prisma/schema.prisma`.
    *   Define models for `User`, `Customer`, and `Matter`.
        *   `User`: `id`, `email` (unique), `password` (hashed), `firmName`, `createdAt`, `updatedAt`.
        *   `Customer`: `id`, `name`, `phone`, `userId` (relation to `User`), `createdAt`, `updatedAt`, `matters` (relation to `Matter[]`).
        *   `Matter`: `id`, `description`, `status` (e.g., open, closed), `customerId` (relation to `Customer`), `createdAt`, `updatedAt`.
    *   Ensure relationships are correctly defined (e.g., a User can have many Customers, a Customer can have many Matters).

5.  **Database Migrations**:
    *   Run `npx prisma migrate dev --name init` to create the initial database schema based on your Prisma models. This will also generate the Prisma Client.

6.  **Implement Authentication (Next.js API Routes)**:
    *   Passwords must be hashed (e.g., using `bcryptjs`).
    *   JWTs should be generated upon successful login and stored in secure, http-only cookies.
    *   **User Model & Prisma Client**:
        *   Ensure Prisma Client is generated and accessible.
    *   **API Routes (`pages/api/auth/...`)**:
        *   `POST /api/auth/signup`:
            *   Validate input (email, password, firm name).
            *   Check if user already exists.
            *   Hash password.
            *   Create new user in the database.
        *   `POST /api/auth/login`:
            *   Validate input (email, password).
            *   Find user by email.
            *   Compare hashed password.
            *   Generate JWT (containing user ID, possibly other non-sensitive info).
            *   Set JWT in an http-only cookie.
        *   `GET /api/auth/me`:
            *   Protected route: require valid JWT from cookie.
            *   Verify JWT.
            *   Return authenticated user's information (excluding password).

7.  **Implement Customer API Routes (`pages/api/customers/...`)**:
    *   All routes (except potentially public listing if design allows) should be protected and require authentication.
    *   Use Prisma Client for database interactions.
    *   Implement error handling (e.g., 400 for bad request, 401 for unauthorized, 404 for not found, 500 for server errors).
    *   `GET /api/customers`: Retrieve a list of customers (owned by the authenticated user).
    *   `POST /api/customers`: Create a new customer (name, phone) associated with the authenticated user.
    *   `GET /api/customers/{customerId}`: Retrieve details of a specific customer.
    *   `PUT /api/customers/{customerId}`: Update a specific customer.
    *   `DELETE /api/customers/{customerId}`: Delete a specific customer.

8.  **Implement Matter API Routes (`pages/api/customers/{customerId}/matters/...`)**:
    *   All routes should be protected.
    *   Ensure `customerId` is valid and belongs to the authenticated user before proceeding.
    *   `GET /api/customers/{customerId}/matters`: Retrieve matters for a specific customer.
    *   `POST /api/customers/{customerId}/matters`: Create a new matter for a customer (description, status).
    *   `GET /api/customers/{customerId}/matters/{matterId}`: Retrieve details of a specific matter.
    *   *(Optional based on instructions, but good practice: PUT and DELETE for matters)*

## Phase 3: Frontend UI (React/Next.js with TailwindCSS)

9.  **Setup Frontend Structure**:
    *   Organize components in a `components` directory.
    *   Create pages in the `pages` directory.
    *   Set up a global layout component if needed (e.g., for navigation, consistent header/footer).

10. **Authentication UI**:
    *   Create a `pages/login.tsx` page with a form for email and password.
        *   On submit, call the `/api/auth/login` endpoint.
        *   Handle success (redirect to dashboard/customer list) and errors (display messages).
    *   Create a `pages/signup.tsx` page with a form for email, password, and firm name.
        *   On submit, call the `/api/auth/signup` endpoint.
    *   Implement client-side logic to manage auth state (e.g., using React Context or a state management library if `NextAuth.js` session management isn't sufficient for your direct JWT cookie approach).
    *   Protect routes: Redirect unauthenticated users from protected pages to the login page.

11. **Customer Management UI**:
    *   `pages/customers.tsx`:
        *   Fetch and display a list of customers from `/api/customers`.
        *   Each customer item should be clickable to view their matters.
    *   Component for creating a new customer:
        *   A form (e.g., modal or separate section/page) to input customer name and phone.
        *   On submit, call `POST /api/customers`.
        *   Refresh customer list on success.
    *   `pages/customers/[customerId].tsx`:
        *   Display details of a single customer.
        *   Fetch and display matters associated with this customer from `/api/customers/{customerId}/matters`.

12. **Matter Management UI**:
    *   Within the customer detail view (`pages/customers/[customerId].tsx` or a dedicated matter component):
        *   Display a list of matters for the current customer.
    *   Component for creating a new matter:
        *   A form to input matter description and status.
        *   On submit, call `POST /api/customers/{customerId}/matters`.
        *   Refresh matter list on success.

13. **Styling**:
    *   Use TailwindCSS utility classes throughout the UI for styling.
    *   Aim for a clean, minimal, and intuitive user experience.

## Phase 4: Testing & Documentation

14. **Unit Tests (Jest)**:
    *   Write basic unit tests for critical backend logic if time permits (e.g., helper functions, complex API logic).
    *   `create-t3-app` may provide an initial Jest setup.

15. **Create `README.md`**:
    *   Detailed instructions on how to set up the project (prerequisites, cloning).
    *   How to configure environment variables (`.env` from `.env.example`).
    *   Steps to run the backend (e.g., `npm run dev`, `docker-compose up -d`).
    *   Steps to run the frontend (usually covered by `npm run dev`).
    *   Overview of the project structure.

16. **Create `.env.example`**:
    *   List all required environment variables with placeholder values.
        *   `DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE"`
        *   `JWT_SECRET="your-super-secret-jwt-key"`
        *   (Any other variables like API keys if applicable)

17. **API Documentation**:
    *   Create a simple Markdown file (e.g., `API_DOCS.md`) or a Postman collection.
    *   Document each endpoint:
        *   HTTP Method and URL.
        *   Request body (if any).
        *   Expected response (success and error).
        *   Required authentication.

## Phase 5: Bonus & Submission

18. **Bonus Features (If Time Permits)**:
    *   Dockerize the Next.js application (`Dockerfile`).
    *   Update `docker-compose.yml` to include the Next.js app service.
    *   Set up GitHub Actions for CI (e.g., linting, testing, building on push/PR).
    *   Implement search/filtering for customers and matters.
    *   Improve UI/UX.

19. **Prepare for Submission**:
    *   Ensure all code is committed to a GitHub repository.
    *   Double-check all requirements from [instructions.md](cci:7://file:///Users/chuck/repos/take-home/legal-matters/instructions.md:0:0-0:0).
    *   Write a note on what was completed and what could be improved if you ran out of time.

## Tech Stack & Key Decisions:

*   **Framework**: Next.js (React) with TypeScript
*   **Styling**: TailwindCSS
*   **Database**: PostgreSQL
*   **ORM**: Prisma
*   **Authentication**: JWT stored in http-only cookies.
*   **API**: Next.js API Routes (RESTful)
*   **Development Environment**: Docker for PostgreSQL
*   **Initial Setup**: `create-t3-app`

This plan should provide a clear roadmap. Remember to commit your changes frequently and test each part as you build it.