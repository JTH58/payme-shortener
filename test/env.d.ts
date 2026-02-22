import "cloudflare:test";

declare module "cloudflare:test" {
  interface ProvidedEnv {
    SHORTENER_KV: KVNamespace;
    FPE_KEY: string;
  }
}
