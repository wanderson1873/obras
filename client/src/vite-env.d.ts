/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/react" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_PUBLISHABLE_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

/** Preenchido por /config.js, gerado pelo container a partir do ambiente. */
interface Window {
  __OBRAS_ENV__?: {
    SUPABASE_URL?: string;
    SUPABASE_PUBLISHABLE_KEY?: string;
  };
}
