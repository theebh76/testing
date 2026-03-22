# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Start dev server with Turbopack
npm run build        # Production build
npm run lint         # ESLint
npm run test         # Run Vitest tests
npm run setup        # npm install + prisma generate + prisma migrate
npm run db:reset     # Hard reset Prisma database
```

To run a single test file:
```bash
npx vitest run src/components/chat/__tests__/ChatInterface.test.tsx
```

Environment: copy `.env.example` or set `ANTHROPIC_API_KEY` — without it, a `MockLanguageModel` fallback generates static placeholder components instead of calling Claude.

## Architecture

UIGen is a Next.js 15 app that lets users describe React components in chat and see them rendered live. Claude uses tool calls to write files into an in-memory virtual file system; those files are transpiled client-side with Babel and rendered in an iframe.

### Request lifecycle

1. User sends a chat message → **ChatContext** (`/lib/contexts/chat-context.tsx`) calls `/api/chat` via Vercel AI SDK's `useChat()`
2. `/api/chat/route.ts` reconstructs the VirtualFileSystem from serialized state, calls `streamText` with Claude (`claude-haiku-4-5`), and registers two tools:
   - `str_replace_editor` — view, create, insert, or replace file content
   - `file_manager` — rename or delete files/directories
3. Claude streams tool calls back; **FileSystemContext** (`/lib/contexts/file-system-context.tsx`) processes them via `handleToolCall()` and updates the in-memory VirtualFileSystem
4. **PreviewFrame** (`/components/preview/PreviewFrame.tsx`) detects changes, runs `jsx-transformer.ts` (Babel + import map), and re-renders the iframe
5. On stream finish, the serialized VirtualFS + messages are saved to the SQLite `Project` record

### Key classes & files

| File | Role |
|------|------|
| `src/lib/file-system.ts` | `VirtualFileSystem` — in-memory Map-based file tree; never writes to disk |
| `src/lib/contexts/chat-context.tsx` | Chat state, `useChat()` wrapper, streams to `/api/chat` |
| `src/lib/contexts/file-system-context.tsx` | VirtualFS state, tool-call handler, auto-selects `/App.jsx` |
| `src/app/api/chat/route.ts` | AI streaming endpoint; registers Claude tools |
| `src/lib/transform/jsx-transformer.ts` | Babel transpiles JSX, collects CSS, builds `esm.sh` import maps |
| `src/components/preview/PreviewFrame.tsx` | Iframe-based live preview; hot-reloads on FS changes |
| `src/components/editor/CodeEditor.tsx` | Monaco editor for the selected virtual file |
| `src/lib/prompts/generation.tsx` | System prompt given to Claude |
| `src/lib/provider.ts` | Returns real Anthropic provider or `MockLanguageModel` fallback |
| `src/actions/index.ts` | `signUp`, `signIn`, `signOut`, `getUser` server actions |
| `prisma/schema.prisma` | `User` + `Project` models; `Project.data` = serialized VirtualFS JSON |

### File system conventions

- Root entry point Claude must produce: `/App.jsx`
- Import alias `@/` maps to `src/`
- All styling via Tailwind CSS (no inline styles)
- External npm imports resolved at runtime via `esm.sh` CDN (no bundling)

### Auth

JWT sessions (7-day), stored in `httpOnly` cookies. Middleware in `src/middleware.ts` protects `/api/projects` and `/api/filesystem`. Anonymous users can build components; work is tracked via `anon-work-tracker.ts` (localStorage).

### Database

Schema is defined in `prisma/schema.prisma` — reference it to understand the structure of data stored in the database. SQLite via Prisma, client generated to `src/generated/prisma`. `Project.messages` and `Project.data` are JSON-stringified columns.

### Testing

Vitest + jsdom + React Testing Library. Test files live at `src/**/__tests__/*.test.tsx`.

## Code Style

Use comments sparingly — only for complex or non-obvious logic.
