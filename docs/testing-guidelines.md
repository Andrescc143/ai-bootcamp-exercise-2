# Testing Guidelines

These guidelines define how tests should be organized and written for the TODO app.

1. Use three test levels: unit tests for isolated functions and components, integration tests for backend API endpoints, and Playwright E2E tests for full user journeys.
2. Write unit tests with Jest. Backend unit tests belong in `packages/backend/__tests__/`, and frontend unit tests belong in `packages/frontend/src/__tests__/`.
3. Name unit test files with the `*.test.js` or `*.test.ts` convention, and keep the filename aligned with the code under test, such as `app.test.js` for `app.js`.
4. Write integration tests with Jest + Supertest in `packages/backend/__tests__/integration/` to exercise real HTTP requests against backend endpoints.
5. Name integration test files with the `*.test.js` or `*.test.ts` convention and use descriptive names based on the API surface they cover, such as `todos-api.test.js`.
6. Write E2E tests with Playwright in `tests/e2e/` using the `*.spec.js` or `*.spec.ts` convention and focus on complete UI workflows.
7. Use only one browser in Playwright test runs, and structure browser flows with the Page Object Model for maintainability.
8. Limit E2E coverage to 5-8 critical user journeys, prioritizing happy paths and the most important edge cases.
9. Keep tests isolated and independent, with explicit setup and teardown so they can run repeatedly in any order, and add or update tests whenever new behavior is introduced.
10. Use environment variables with sensible defaults for port configuration, such as `PORT=3030` for the backend and the frontend default React port when not overridden.
