# arkit

[![npm version](https://img.shields.io/npm/v/arkit)](https://www.npmjs.com/package/arkit)
[![license](https://img.shields.io/npm/l/arkit)](LICENSE)
[![downloads](https://img.shields.io/npm/dm/arkit)](https://www.npmjs.com/package/arkit)

A command-line scaffolding tool that boots a production-ready React + Vite + TypeScript project in seconds — with optional Tailwind CSS, React Router, and ESLint, wired up and ready to go.

## Why

`npm create vite` gives you a barebones template. arkit gives you a configured project with Tailwind, Router, ESLint, and strict TypeScript — all in one command. No manual setup, no copy-pasting configs.

## Quick Start

```bash
npx arkit init my-project
cd my-project
npm install
npm run dev
```

## Installation

```bash
npm install -g arkit
```

## Usage

```bash
arkit init <project-name> [options]
```

### Options

| Flag | Description |
|------|-------------|
| `--tailwind` | Include Tailwind CSS + PostCSS config |
| `--router` | Include React Router with BrowserRouter |
| `--eslint` | Include ESLint with React + Hooks rules |
| `--javascript` | Use plain JavaScript (no TypeScript) |
| `--pnpm` | Use pnpm instead of npm |
| `--yarn` | Use yarn instead of npm |
| `--no-git` | Skip git initialization |
| `--force` | Overwrite existing directory |

### Examples

```bash
# Basic TypeScript project
arkit init my-app

# Full stack: Tailwind + Router + ESLint
arkit init my-app --tailwind --router --eslint

# JavaScript with pnpm
arkit init my-app --javascript --pnpm

# Quick prototype, skip git
arkit init my-app --no-git
```

## What You Get

```
my-app/
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
├── .gitignore
├── .env.example
└── src/
    ├── main.tsx
    ├── App.tsx
    ├── App.css
    └── index.css
```

With `--tailwind`:
- `tailwind.config.js` + `postcss.config.js` + Tailwind directives in `index.css`

With `--router`:
- BrowserRouter wrapping `<App />` in `main.tsx`

With `--eslint`:
- `eslint.config.js` with React, Hooks, and Refresh rules

## License

MIT

<!-- ach: 2026-09-04 00:01:22 -->

<!-- ach: 2026-09-04 12:30:17 -->

<!-- ach: 2026-09-04 20:00:11 -->

<!-- ach: 2026-09-04 22:30:10 -->
