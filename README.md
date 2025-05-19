# frontend

## Developing

Once you've checked out the project and installed dependencies with `bun install`, start a development server:

```bash
bun --bun run dev
```

## Project Structure

The project follows a typical SvelteKit structure with the following main directories and files:

### Root Directory
- `/src` - Main source code directory
- `/static` - Static assets directory
- `/messages` - Internationalization message files
- `/.svelte-kit` - SvelteKit build output (generated)

### Source Code (`/src`)
- `/routes` - Application routes and pages
- `/lib` - Shared library code
    - `/components` - Reusable UI components from [shadcn-svelte@next](https://next.shadcn-svelte.com/)
    - `/hooks` - Custom hooks
    - `/icons` - Custom Icon files (default icons should be used from [Lucide](https://lucide.dev/icons/))
    - `/server` - Server-side code
- `app.css` - Global CSS styles
- `app.html` - HTML template
- `hooks.ts` - Client-side hooks
- `hooks.server.ts` - Server-side hooks

### Configuration Files
- `svelte.config.js` - SvelteKit configuration
- `vite.config.ts` - Vite bundler configuration
- `tsconfig.json` - TypeScript configuration
- `package.json` - Project dependencies and scripts
- `components.json` - Shadcn-Svelte UI components configuration

### Other Files
- `.gitignore` - Git ignore rules