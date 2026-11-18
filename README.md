# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

## API configuration

The frontend uses `/api` by default. In development, Vite proxies these requests to `http://localhost:8000`; start the backend on that address before using the app.

For production, configure the web server to proxy `/api` to the backend, or set `VITE_API_BASE_URL` to the backend's publicly reachable base URL (including `/api`) before building. Do not use `localhost` for a remotely hosted frontend: it refers to each visitor's own device.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and Oxlint's TypeScript related rules in your project.
