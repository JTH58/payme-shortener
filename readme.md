# PayMe.tw Shorter (s.payme.tw)

> **零知識加密、閱後即焚。**
> PayMe.tw 專用安全短連結服務 — 伺服器只保管密文與半把鑰匙，永遠看不懂你的內容。

[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](./LICENSE)
![Cloudflare Workers](https://img.shields.io/badge/Cloudflare-Workers-orange)
![Zero Knowledge](https://img.shields.io/badge/encryption-zero--knowledge-brightgreen)

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

### 雙鑰匙零知識加密

短連結的安全性建立在「**鑰匙一分為二**」的原則上：

```
完整金鑰 = ClientKey（你持有） ⊕ ServerKey（伺服器持有）
```

| 組件 | 存放位置 | 伺服器可見 |
|------|---------|-----------|
| **ClientKey** | URL `#` 之後 | ❌ 瀏覽器不傳送 hash |
| **ServerKey** | Cloudflare KV | ✅ 但缺少 ClientKey 無法解密 |
| **Ciphertext** | Cloudflare KV | ✅ 但無完整金鑰，密文毫無意義 |

### 攻擊情境分析

| 情境 | 攻擊者取得 | 缺少 | 結果 |
|------|-----------|------|------|
| 攔截網址 | ShortCode + ClientKey | ServerKey + Ciphertext | ❌ 無法解密 |
| 攻破資料庫 | Ciphertext + ServerKey | ClientKey | ❌ 無法解密 |
| 兩者皆得 | 全部 | — | ⚠️ 任何系統在此威脅等級下皆無法防禦 |

### 12 小時閱後即焚

所有短連結在建立後 **12 小時自動銷毀**，由 Cloudflare KV 原生 TTL 機制執行，無需人為介入。過期後資料從物理層面不復存在。

---

## 運作方式

### 建立短連結

```
用戶 (payme.tw)                    s.payme.tw Worker               KV
     │                                    │                        │
     ├─ 產生 ClientKey + ServerKey         │                        │
     ├─ FullKey = derive(Client+Server)    │                        │
     ├─ 加密 Payload → Ciphertext          │                        │
     │                                    │                        │
     ├─ POST { ciphertext, serverKey } ──→│                        │
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
  │                                    │     serverKey } ───────│
  │←── HTML + ciphertext + serverKey ──│                        │
  │                                    │                        │
  ├─ 從 # 取得 ClientKey               │                        │
  ├─ FullKey = derive(Client+Server)   │                        │
  ├─ 解密 → 原始 payme.tw 連結          │                        │
  ├─ redirect                          │                        │
```

---

## 技術棧

| 層級 | 技術 |
|------|------|
| Runtime | Cloudflare Workers |
| 儲存 | Cloudflare KV（原生 TTL 支援） |
| 加密 | Web Crypto API — AES-256-GCM |
| 網域 | s.payme.tw |

---

## 不是什麼

- ❌ **不是通用縮網址服務** — 僅服務 payme.tw 連結
- ❌ **不是永久連結** — 12 小時後自動銷毀，這是 feature 不是 bug
- ❌ **不會讀取你的資料** — 伺服器從頭到尾看不懂它在幫你保管什麼

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
