export function renderLandingPage(): string {
  return `<!DOCTYPE html>
<html lang="zh-TW">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>s.payme.tw — PayMe.tw 專用安全短連結</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;color:#1a1a1a;line-height:1.6;max-width:720px;margin:0 auto;padding:2rem 1rem}
h1{font-size:1.8rem;margin-bottom:.5rem}
h2{font-size:1.3rem;margin:2rem 0 1rem;color:#333}
p{margin:.5rem 0}
.hero{text-align:center;padding:3rem 0 2rem}
.hero .subtitle{color:#555;font-size:1.1rem}
.cta{display:inline-block;margin-top:1.5rem;padding:.75rem 2rem;background:#0066ff;color:#fff;text-decoration:none;border-radius:8px;font-weight:600}
.cta:hover{background:#0052cc}
section{margin:2rem 0;padding:1.5rem;background:#f8f9fa;border-radius:8px}
table{width:100%;border-collapse:collapse;margin:1rem 0}
td,th{padding:.75rem;text-align:left;border-bottom:1px solid #e0e0e0;vertical-align:top}
th{width:30%;font-weight:600;white-space:nowrap}
.footer{text-align:center;margin-top:3rem;padding-top:1.5rem;border-top:1px solid #e0e0e0;color:#666;font-size:.9rem}
.footer a{color:#0066ff;text-decoration:none}
@media(max-width:480px){body{padding:1rem .75rem}h1{font-size:1.4rem}section{padding:1rem}}
</style>
</head>
<body>
<div class="hero">
  <h1>PayMe.tw 專用安全短連結</h1>
  <p class="subtitle">連伺服器自己都解不開的加密短網址。12 小時後，一切自動消失。</p>
  <a class="cta" href="https://payme.tw">前往 PayMe.tw &rarr;</a>
</div>

<section>
  <h2>為什麼不用別人的縮網址？</h2>
  <p>當你使用第三方縮網址服務，你的分帳連結（包含銀行帳號與金額）會完整交給對方的伺服器。</p>
  <p><strong>s.payme.tw 是 PayMe.tw 的自建短連結服務。</strong>你的資料不會流向任何第三方，而且我們的伺服器本身也讀不懂你的內容。</p>
</section>

<section>
  <h2>零知識加密架構</h2>
  <p>你的資料被拆成兩半。一半在你手上，一半在伺服器。缺任何一半都無法還原。</p>
  <table>
    <tr><th>雙鑰匙分持</th><td>完整解密金鑰被拆為兩半 — ClientKey 藏在網址 # 之後，只有你和收到連結的人持有；ServerKey 存在伺服器端。兩把鑰匙缺一不可。</td></tr>
    <tr><th>AES-256-GCM</th><td>與銀行同等級的對稱式加密標準。你的分帳資料在離開瀏覽器之前就已加密。</td></tr>
    <tr><th>URL Hash 隔離</th><td>ClientKey 存在網址的 # 之後。根據 HTTP 協議，# 後面的內容不會被瀏覽器傳送至伺服器。</td></tr>
    <tr><th>12 小時閱後即焚</th><td>所有資料在建立後 12 小時由 Cloudflare 基礎設施自動銷毀。時間到了，物理消失。</td></tr>
    <tr><th>完整開源</th><td>不要相信我們的話 — 看我們的程式碼。加密邏輯、伺服器邏輯、前端解密流程全部公開。</td></tr>
  </table>
</section>

<section>
  <h2>技術規格</h2>
  <table>
    <tr><th>加密演算法</th><td>AES-256-GCM</td></tr>
    <tr><th>金鑰衍生</th><td>HKDF-SHA256（ClientKey + ServerKey）</td></tr>
    <tr><th>ClientKey 傳輸</th><td>URL Fragment（# 後），不經過伺服器</td></tr>
    <tr><th>ServerKey 長度</th><td>32 bytes（256 bits）</td></tr>
    <tr><th>資料存活時間</th><td>12 小時（Cloudflare KV TTL）</td></tr>
    <tr><th>執行環境</th><td>Cloudflare Workers（邊緣運算）</td></tr>
    <tr><th>適用範圍</th><td>僅限 PayMe.tw 分帳連結</td></tr>
  </table>
</section>

<div class="footer">
  <p><strong>s.payme.tw</strong> 是 <a href="https://payme.tw">PayMe.tw</a> 的子專案。</p>
  <p>完整程式碼公開於 <a href="https://github.com/JTH58/payme-shortener">github.com/JTH58/payme-shortener</a>。</p>
  <p>不要相信我們，驗證我們。</p>
</div>
</body>
</html>`;
}
