# PayMe.tw Shorter (s.payme.tw)

> **密文儲存加密、閱後即焚。**
> PayMe.tw 專用安全短連結服務 — 伺服器只保管密文，金鑰只在你手中。

[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](./LICENSE)
![Cloudflare Workers](https://img.shields.io/badge/Cloudflare-Workers-orange)
![Encrypted Storage](https://img.shields.io/badge/encryption-encrypted--storage-brightgreen)

---

## 為什麼需要這個？

[PayMe.tw](https://payme.tw) 的分帳連結包含加密資料，網址動輒 200+ 字元。在 LINE 群組裡分享這種長連結既不美觀，也容易被截斷。

我們不想讓你的連結流向第三方縮網址服務（你無法控制它們的隱私政策），所以打造了 `s.payme.tw` — 一個**你能信任的**短連結服務。

```
之前：https://payme.tw/bill/.../#/?data=0N4IgRiBcIBwEwGYQBoQEMqxgNgIzY... (200+ 字元)
之後：https://s.payme.tw/aBcD#xTg7 (約 27 字元)
```

---

## 安全架構

### 密文儲存加密

短連結的安全性建立在「**金鑰不留存**」的原則上：

```
加密金鑰 = HKDF-SHA256(ClientKey)
```

| 組件 | 存放位置 | 伺服器可見 |
|------|---------|-----------|
| **ClientKey** | URL `#` 之後 | ❌ 瀏覽器不傳送 hash |
| **Ciphertext** | Cloudflare KV | ✅ 但無金鑰，密文毫無意義 |

### 三道防線

| 防線 | 機制 | 效果 |
|------|------|------|
| **Rate Limit** | Resolve API 限制 100 次/分鐘 | 暴力破解 ClientKey 不可行 |
| **TTL 12h** | 建立後 12 小時自動銷毀 | 攻擊時間窗口有限 |
| **密文儲存** | KV 只存密文，無金鑰 | 即使資料庫外洩，密文不可解 |

### 攻擊情境分析

| 情境 | 攻擊者取得 | 缺少 | 結果 |
|------|-----------|------|------|
| 攔截網址 | ShortCode + ClientKey | Ciphertext | ❌ 無法解密（需存取 KV） |
| 攻破資料庫 | Ciphertext | ClientKey | ❌ 無法解密（4 碼暴力破解受 Rate Limit 限制） |
| 兩者皆得 | 全部 | — | ⚠️ 任何系統在此威脅等級下皆無法防禦 |

---

## 運作方式

### 建立短連結

```
用戶 (payme.tw)                    s.payme.tw Worker               KV
     │                                    │                        │
     ├─ 產生 ClientKey                     │                        │
     ├─ EncKey = deriveEncKey(ClientKey)   │                        │
     ├─ 加密 Payload → Ciphertext          │                        │
     │                                    │                        │
     ├─ POST { ciphertext, mode } ──────→│                        │
     │                                    ├─ 產生 ShortCode ──────→│
     │                                    │   (counter + 混淆映射)  │ SET TTL=12h
     │                                    │←─ OK ─────────────────│
     │←── ShortCode ──────────────────────│                        │
     │                                    │                        │
     ├─ 組合: s.payme.tw/{code}#{key}      │                        │
```

### 解析短連結

```
訪客                              s.payme.tw Worker               KV
  │                                    │                        │
  ├─ GET /aBcD#xTg7 ────────────────→│                        │
  │   (# 後面不會送出)                  ├─ GET "aBcD" ──────────→│
  │                                    │←─ { ciphertext,        │
  │                                    │     mode } ────────────│
  │←── HTML + JS ──────────────────────│                        │
  │                                    │                        │
  ├─ JS 從 # 取得 ClientKey            │                        │
  ├─ POST /api/resolve ──────────────→│                        │
  │   { code, clientKey }              ├─ deriveEncKey(clientKey)│
  │                                    ├─ decrypt(ciphertext)   │
  │←── { url } ───────────────────────│                        │
  ├─ redirect → 原始 payme.tw 連結     │                        │
```

---

## 技術棧

| 層級 | 技術 |
|------|------|
| Runtime | Cloudflare Workers |
| 儲存 | Cloudflare KV（原生 TTL 支援） |
| 加密 | Web Crypto API — AES-256-GCM |
| 金鑰衍生 | HKDF-SHA256（ClientKey） |
| 網域 | s.payme.tw |

---

## 不是什麼

- ❌ **不是通用縮網址服務** — 僅服務 payme.tw 連結
- ❌ **不是永久連結** — 12 小時後自動銷毀，這是 feature 不是 bug
- ❌ **不會儲存你的金鑰** — 伺服器只保管密文，解密金鑰只在你的連結裡

---

## 本地開發

```bash
# 安裝依賴
npm install

# 啟動開發伺服器
npx wrangler dev

# 執行測試
npm test
```

---

## 相關專案

- **[PayMe.tw](https://github.com/JTH58/payme)** — 零後端 TWQR 產生器（主專案）

---

## License

[MIT License](./LICENSE) - Copyright (c) 2026 JTH58
