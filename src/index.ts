// Build: 2026-07-15 02:30:52 | run 1784097052
#!/usr/bin/env node
import { Command } from "commander";
import { existsSync, writeFileSync, mkdirSync, copyFileSync } from "fs";
import { join, resolve } from "path";
import { execSync } from "child_process";

const program = new Command();

program
  .name("arkit")
  .description("Scaffold a React + Vite project")
  .argument("<name>", "project name")
  .option("--router", "include React Router")
  .option("--tailwind", "include Tailwind CSS")
  .option("--javascript", "use JavaScript instead of TypeScript")
  .option("--no-git", "skip git init")
  .option("--force", "overwrite existing directory")
  .option("--pnpm", "use pnpm instead of npm")
  .option("--yarn", "use yarn instead of npm")
  .option("--eslint", "include ESLint configuration")
  .action((name: string, options: Record<string, unknown>) => {
    const projectDir = resolve(process.cwd(), name);

    if (existsSync(projectDir)) {
      if (options.force) {
        execSync(`rm -rf "${projectDir}"`);
      } else {
        console.error(`Error: Directory "${name}" already exists. Use --force to overwrite.`);
        process.exit(1);
      }
    }

    const useTs = !options.javascript;
    const ext = useTs ? "ts" : "js";
    const extReact = useTs ? "tsx" : "jsx";

    mkdirSync(projectDir, { recursive: true });
    mkdirSync(join(projectDir, "src"));
    mkdirSync(join(projectDir, "public"));

    const pkg = {
      name,
      private: true,
      version: "0.0.0",
      type: "module",
      scripts: {
        dev: "vite",
        build: "tsc -b && vite build",
        preview: "vite preview",
      },
    };

    if (options.eslint) {
      (pkg.scripts as Record<string, string>).lint = "eslint src/";
    }

    if (!useTs) {
      (pkg.scripts as Record<string, string>).build = "vite build";
    }

    writeFileSync(join(projectDir, "package.json"), JSON.stringify(pkg, null, 2));

    const tsconfig = {
      compilerOptions: {
        tsBuildInfoFile: "./node_modules/.tmp/tsconfig.app.tsbuildinfo",
        target: "ES2020",
        useDefineForClassFields: true,
        lib: ["ES2020", "DOM", "DOM.Iterable"],
        module: "ESNext",
        skipLibCheck: true,
        moduleResolution: "bundler",
        allowImportingTsExtensions: true,
        isolatedModules: true,
        moduleDetection: "force",
        noEmit: true,
        jsx: "react-jsx",
        strict: true,
        noUnusedLocals: true,
        noUnusedParameters: true,
        noFallthroughCasesInSwitch: true,
        noUncheckedSideEffectImports: true,
      },
    };

    if (useTs) {
      writeFileSync(join(projectDir, "tsconfig.json"), JSON.stringify(tsconfig, null, 2));
    }

    const viteConfig = `import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
})
`;

    writeFileSync(join(projectDir, useTs ? "vite.config.ts" : "vite.config.js"), viteConfig);

    const indexHtml = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${name}</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.${extReact}"></script>
  </body>
</html>
`;

    writeFileSync(join(projectDir, "index.html"), indexHtml);

    const mainContent = `import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
${options.router ? "import { BrowserRouter } from 'react-router-dom'" : ""}
import App from './App.${extReact}'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    ${options.router ? "<BrowserRouter>" : ""}
      <App />
    ${options.router ? "</BrowserRouter>" : ""}
  </StrictMode>,
)
`;

    writeFileSync(join(projectDir, `src/main.${extReact}`), mainContent);

    const appContent = `import './App.css'

function App() {
  return <h1>Hello from ${name}</h1>
}

export default App
`;

    writeFileSync(join(projectDir, `src/App.${extReact}`), appContent);

    writeFileSync(join(projectDir, "src/App.css"), "");

    const indexCss = `:root {
  font-family: system-ui, sans-serif;
  line-height: 1.5;
  color: #213547;
  background-color: #fff;
}
`;

    writeFileSync(join(projectDir, "src/index.css"), indexCss);

    const gitignoreContent = `node_modules
dist
.env
*.local
`;

    writeFileSync(join(projectDir, ".gitignore"), gitignoreContent);

    const envContent = `# Environment Variables
`;

    writeFileSync(join(projectDir, ".env.example"), envContent);

    if (options.tailwind) {
      const twConfig = `/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: { extend: {} },
  plugins: [],
};
`;

      writeFileSync(join(projectDir, "tailwind.config.js"), twConfig);
      writeFileSync(join(projectDir, "postcss.config.js"), `export default { plugins: { tailwindcss: {}, autoprefixer: {} } }`);

      const tailwindCss = `@tailwind base;
@tailwind components;
@tailwind utilities;
`;

      writeFileSync(join(projectDir, "src/index.css"), tailwindCss);
    }

    if (options.eslint) {
      const eslintConfig = `import js from '@eslint/js'
import globals from 'globals'
import react from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'

export default [
  { ignores: ['dist'] },
  {
    files: ['**/*.{${useTs ? "ts,tsx" : "js,jsx"}}'],
    ...js.configs.recommended,
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: { ecmaVersion: 'latest', ecmaFeatures: { jsx: true } },
    },
    plugins: { react, 'react-hooks': reactHooks, 'react-refresh': reactRefresh },
    rules: {
      ...react.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
      'react/react-in-jsx-scope': 'off',
    },
  },
]
`;
      writeFileSync(join(projectDir, useTs ? "eslint.config.js" : "eslint.config.mjs"), eslintConfig);
    }

    const npmClient = options.pnpm ? "pnpm" : options.yarn ? "yarn" : "npm";
    const installCmd = options.pnpm ? "pnpm install" : options.yarn ? "yarn" : "npm install";

    console.log(`\n  ✨ Created ${name} at ${projectDir}\n`);
    console.log(`  cd ${name}`);
    console.log(`  ${installCmd}`);
    console.log(`  ${npmClient} run dev\n`);
  });

program.parse();
