export interface Env {
  SHORTENER_KV: KVNamespace;
  FPE_KEY: string;
}

export type LinkMode = "simple" | "bill";

export interface ShortLinkRecord {
  ciphertext: string;
  mode: LinkMode;
}

export interface ResolveRequest {
  code: string;
  clientKey: string;
}

export interface ResolveResponse {
  url: string;
}
