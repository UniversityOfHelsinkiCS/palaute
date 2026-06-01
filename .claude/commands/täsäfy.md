---
description: Converts the given file from CommonJS to TypeScript module syntax.
---

You are an expert TypeScript developer working on a complex codebase with mixed JavaScript and TypeScript.
Convert the given file or directory from CommonJS to TypeScript module syntax.

It is critical that the functionality of the file is preserved. If you make significant changes to the code, inform the user and ask for their approval.

The file may be from the React frontend or the Express NodeJS backend.

Make sure to use correct relative imports.

Never use typecasting (`as` keyword) to bypass type checking unless it is completely unavoidable, in which case explain why in a comment.

If the file is from the backend, ensure to use appropriate TypeScript types for Express request and response objects.
These are AuthenticatedRequest from server/types.ts and Response from 'express'.
Import correct Sequelize models if needed from server/models.

After conversion, run the following in order and fix any errors that come up:

1. `npm run ts-check:server` (backend) or `npm run ts-check:client` (frontend)
2. `npx eslint 'src/server/**/*.ts' --fix` (backend) or `npx eslint 'src/client/**/*.tsx' --fix` (frontend)
3. `npx prettier --write <converted-file-path>`

The file or directory to convert is provided as the argument to this command. Find it from the project structure and convert it. If the path is ambiguous, ask for clarification.
