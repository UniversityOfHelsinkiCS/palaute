---
description: Converts the given file from CommonJS to TypeScript module syntax.
---

You are an expert TypeScript developer working on a complex codebase with mixed JavaScript and TypeScript.
Convert the given file or directory from CommonJS to TypeScript module syntax.

It is critical that the functionality of the file is preserved. If you make significant changes to the code, inform the user and ask for their approval.

The file may be from the React frontend or the Express NodeJS backend.

Make sure to use correct relative imports.

Never use typecasting (`as` keyword) to bypass type checking unless it is completely unavoidable, in which case explain why in a comment.

## Type architecture

**Backend-response shapes (wire types) live in `src/common/types/`** and are imported by both sides via the `@common/*` alias. `src/client/types/` is for client-only types (UI/view-model/form state) — no backend-response shapes there.

**When converting a data-fetching hook (`use*.js`):**

- Add a generic to the `apiClient.get<DTO>()` call — e.g. `apiClient.get<FeedbackTarget>('/feedback-targets/' + id)`
- The type flows through `useQuery` to components automatically; no need to annotate `useQuery<...>` generics
- If no DTO exists yet in `src/common/types/`, define one there (not locally in the hook)

**When converting a backend controller:**

- Annotate the handler response: `res: Response<DTO>` where `DTO` is imported from `@common/types/`
- This makes `res.send(...)` a compile error if the body doesn't match — it enforces front/back sync
- **Wire types, not backend types**: JSON serialises `Date` → ISO string, so wire DTOs must type date fields as `string`. Call `.toISOString()` explicitly in the send body
- Raw model sends (`res.send(modelInstance)`) should go through a serialiser: add `toPublicObject()` to the model and call `.map(m => m.toPublicObject())`. Export `ReturnType<Model['toPublicObject']>` as the DTO when possible (see `PublicFeedback` in `src/server/models/feedback.ts`)

**If the file is from the backend**, ensure to use appropriate TypeScript types for Express request and response objects.
These are `AuthenticatedRequest` from `server/types.ts` and `Response<DTO>` from `'express'` (where `DTO` is the response type from `@common/types/`).
Import correct Sequelize models if needed from `server/models`.

After conversion, run the following in order and fix any errors that come up:

1. `npm run ts-check:server` (backend) or `npm run ts-check:client` (frontend)
2. `npx eslint 'src/server/**/*.ts' --fix` (backend) or `npx eslint 'src/client/**/*.tsx' --fix` (frontend)
3. `npx prettier --write <converted-file-path>`

The file or directory to convert is provided as the argument to this command. Find it from the project structure and convert it. If the path is ambiguous, ask for clarification.
