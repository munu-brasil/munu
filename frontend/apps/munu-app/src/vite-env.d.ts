/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_PUBLIC_RPC: string;
  readonly VITE_PUBLIC_ENVIRONMENT: string;
  readonly VITE_PUBLIC_LUT: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
