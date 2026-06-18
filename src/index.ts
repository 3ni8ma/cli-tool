#!/usr/bin/env node
import { Command } from 'commander'
import { mkdirSync, writeFileSync, existsSync } from 'fs'
import { resolve } from 'path'
import { createRequire } from 'module'

const require = createRequire(import.meta.url)
const pkg = require('../package.json')

const program = new Command()

program
  .name('arkit')
  .description('Scaffold a React + Vite + TypeScript project')
  .version(pkg.version)

program
  .command('init <name>')
  .description('Create a new React + Vite project')
  .option('--router', 'Include React Router')
  .option('--tailwind', 'Include Tailwind CSS')
  .option('--no-git', 'Skip git initialization')
  .action((name: string, opts: { router?: boolean; tailwind?: boolean; git?: boolean }) => {
    const dir = resolve(process.cwd(), name)
    if (existsSync(dir)) {
      console.error(`Error: Directory "${name}" already exists`)
      process.exit(1)
    }

    mkdirSync(dir, { recursive: true })
    console.log(`Creating project "${name}"...`)

    const deps = ['react', 'react-dom']
    const devDeps = [
      'typescript',
      'vite',
      '@vitejs/plugin-react',
      '@types/react',
      '@types/react-dom',
    ]

    if (opts.router) {
      deps.push('react-router-dom')
    }
    if (opts.tailwind) {
      devDeps.push('tailwindcss', 'postcss', 'autoprefixer')
    }

    writeFileSync(
      resolve(dir, 'package.json'),
      JSON.stringify(
        {
          name,
          private: true,
          version: '1.0.0',
          type: 'module',
          scripts: {
            dev: 'vite',
            build: 'vite build',
            preview: 'vite preview',
          },
          dependencies: Object.fromEntries(deps.map((d) => [d, '*'])),
          devDependencies: Object.fromEntries(devDeps.map((d) => [d, '*'])),
        },
        null,
        2
      )
    )

    writeFileSync(
      resolve(dir, 'tsconfig.json'),
      JSON.stringify(
        {
          compilerOptions: {
            target: 'ES2022',
            lib: ['ES2023', 'DOM', 'DOM.Iterable'],
            module: 'ESNext',
            moduleResolution: 'bundler',
            jsx: 'react-jsx',
            strict: true,
            skipLibCheck: true,
            noEmit: true,
          },
          include: ['src'],
        },
        null,
        2
      )
    )

    writeFileSync(
      resolve(dir, 'vite.config.ts'),
      `import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
})
`
    )

    mkdirSync(resolve(dir, 'src'))
    mkdirSync(resolve(dir, 'public'))

    writeFileSync(
      resolve(dir, 'index.html'),
      `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${name}</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
`
    )

    writeFileSync(
      resolve(dir, 'src/main.tsx'),
      `import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
`
    )

    writeFileSync(
      resolve(dir, 'src/App.tsx'),
      `function App() {
  return (
    <div>
      <h1>Hello from ${name}</h1>
    </div>
  )
}

export default App
`
    )

    writeFileSync(
      resolve(dir, 'src/index.css'),
      opts.tailwind
        ? `@tailwind base;
@tailwind components;
@tailwind utilities;
`
        : `* { margin: 0; padding: 0; box-sizing: border-box; }
body { font-family: system-ui, sans-serif; }
`
    )

    if (opts.tailwind) {
      writeFileSync(
        resolve(dir, 'tailwind.config.js'),
        `/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: { extend: {} },
  plugins: [],
}
`
      )
      writeFileSync(
        resolve(dir, 'postcss.config.js'),
        `export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
`
      )
    }

    if (opts.router) {
      const appContent = `import { BrowserRouter, Routes, Route } from 'react-router-dom'

function Home() { return <h1>Home</h1> }
function About() { return <h1>About</h1> }

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
`
      writeFileSync(resolve(dir, 'src/App.tsx'), appContent)
    }

    writeFileSync(resolve(dir, '.gitignore'), `node_modules\ndist\n`)

    if (opts.git !== false) {
      const { execSync } = require('child_process')
      execSync('git init', { cwd: dir, stdio: 'inherit' })
    }

    console.log(`\nDone! Created project at: ${name}`)
    console.log('\nNext steps:')
    console.log(`  cd ${name}`)
    console.log('  npm install')
    console.log('  npm run dev')
  })

program.parse(process.argv)
