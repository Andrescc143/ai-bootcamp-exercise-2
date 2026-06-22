# Coding Guidelines

These guidelines ensure consistent, maintainable, and high-quality code across the TODO app.

1. Keep code readable and consistent by following existing project style conventions and using clear, intention-revealing names.
2. Use consistent formatting in all files. Prefer automated formatting and avoid mixing formatting styles in the same file.
3. Organize imports in a predictable order: external libraries first, internal modules second, and local relative imports last, with a blank line between groups.
4. Remove unused imports, variables, and dead code as part of every change.
5. Use ESLint as the baseline quality gate. Address lint warnings and errors before merging changes.
6. Apply the DRY principle: extract repeated logic into reusable functions, utilities, or shared components when repetition appears.
7. Keep functions and components focused on a single responsibility, and favor small composable units over large multipurpose blocks.
8. Prefer explicit error handling for async operations and return user-safe messages from the UI or API layer.
9. Write comments only when needed to explain non-obvious intent, trade-offs, or constraints, not to restate the code.
10. When adding or modifying behavior, update the relevant tests and keep implementation patterns consistent with the existing backend and frontend architecture.
