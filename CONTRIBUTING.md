# Contributing to AnalyticxIQ

Thank you for your interest in contributing to AnalyticxIQ! To ensure a smooth pairing and review process, please follow the guidelines below.

---

## 🏁 1. Development Setup

1.  **Fork and Clone**:
    ```bash
    git clone https://github.com/Kishanfdt/AnalyticxIQ.git
    cd AnalyticxIQ
    ```
2.  **Install Dependencies**: Install root and workspace dependencies concurrently:
    ```bash
    npm install
    ```
3.  **Local Database**: Ensure PostgreSQL is active on port 5432. Configure the connection string in `server/.env`.
4.  **Database Migration**: Apply migrations:
    ```bash
    npm run prisma:migrate --workspace=server
    ```
5.  **Compile Shared Library**:
    ```bash
    npm run build:shared
    ```
6.  **Run Development Servers**:
    ```bash
    # Run server (Port 5000)
    npm run dev:server

    # Run client (Port 3000)
    npm run dev:client
    ```

---

## 🌿 2. Branching Guidelines

We use logical prefixes to organize repository branches. Name your branch using the following format:

- `feat/your-feature-name` – For new features.
- `bugfix/issue-description` – For bugs or hotfixes.
- `docs/documentation-topic` – For documentation improvements.
- `chore/maintenance-topic` – For dependency updates, formatting, or build updates.

---

## 🎨 3. Coding Standards & Style

We enforce strict quality control metrics before code can be merged:

### TypeScript Strict Mode

- Strict typing is enabled across all workspaces.
- Avoid using the `any` keyword. Use explicit type signatures or generic assertions.

### Formatting & Linting

Ensure code is fully formatted and linted prior to committing:

```bash
# Check code style with ESLint
npm run lint

# Auto-format all workspace files with Prettier
npm run format
```

---

## 🧪 4. Testing Guidelines

Any bug fix or new feature must be accompanied by relevant test coverage. We use **Vitest** for backend unit and integration testing.

Run tests:

```bash
npm run test --workspace=server
```

---

## 📥 5. Pull Request (PR) Requirements

When submitting a Pull Request, please ensure the following:

1.  **Single Scope**: Keep PRs focused on a single logical change or issue.
2.  **Commit Messages**: Keep commit messages descriptive and clear.
    - _Example_: `feat(sales): calculate backend price and margins in create transaction`
3.  **Run Verifications**: Ensure ESLint, Prettier formatting, and Vitest test runs all pass successfully before opening the PR.
4.  **Description**: Fill out the PR template with:
    - What issue/feature this PR addresses.
    - Any manual verification steps performed.
    - Screenshots for front-end modifications.
