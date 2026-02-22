export interface Env {
  SHORTENER_KV: KVNamespace;
  FPE_KEY: string;
}

export type LinkMode = "simple" | "bill";

export interface ShortLinkRecord {
  ciphertext: string;
  serverKey: string;
  mode: LinkMode;
}
