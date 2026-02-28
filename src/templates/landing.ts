export function renderLandingPage(): string {
  return `<!DOCTYPE html>
<html lang="zh-TW" class="dark">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>s.payme.tw — PayMe.tw 專用安全短連結</title>
<meta name="description" content="密文儲存加密短網址。PayMe.tw 專用安全短連結服務。">
<meta property="og:type" content="website">
<meta property="og:url" content="https://s.payme.tw/">
<meta property="og:title" content="s.payme.tw — PayMe.tw 專用安全短連結">
<meta property="og:description" content="密文儲存加密短網址。12 小時後，一切自動消失。">
<meta property="og:image" content="https://payme.tw/og-simple.jpg">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="PayMe.tw Preview">
<meta property="og:site_name" content="PayMe.tw">
<meta property="og:locale" content="zh_TW">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="s.payme.tw — PayMe.tw 專用安全短連結">
<meta name="twitter:description" content="密文儲存加密短網址。12 小時後，一切自動消失。">
<meta name="twitter:image" content="https://payme.tw/og-simple.jpg">
<link rel="icon" href="https://payme.tw/favicon.ico">
<link rel="apple-touch-icon" href="https://payme.tw/apple-icon.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Inter',system-ui,-apple-system,sans-serif;color:rgba(255,255,255,.87);line-height:1.6;background:#020617;min-height:100vh;overflow-x:hidden}
body::before{content:'';position:fixed;top:-200px;left:50%;transform:translateX(-50%);width:800px;height:600px;background:rgba(59,130,246,.1);border-radius:50%;filter:blur(120px);pointer-events:none;z-index:0}
.container{max-width:720px;margin:0 auto;padding:2rem 1rem;position:relative;z-index:1}
.badge{display:inline-flex;align-items:center;gap:.5rem;padding:.375rem .75rem;border-radius:9999px;background:rgba(59,130,246,.1);border:1px solid rgba(59,130,246,.2);color:rgba(96,165,250,1);font-size:.75rem;font-weight:500;backdrop-filter:blur(8px)}
.badge svg{width:14px;height:14px}
.hero{text-align:center;padding:4rem 0 2.5rem}
h1{font-size:2rem;font-weight:700;letter-spacing:-.02em;background:linear-gradient(to bottom,#fff,rgba(255,255,255,.4));-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;padding-bottom:.25rem;line-height:1.2}
.subtitle{color:rgba(255,255,255,.4);font-size:1.1rem;margin-top:.75rem;max-width:480px;margin-left:auto;margin-right:auto}
.cta{display:inline-block;margin-top:1.75rem;padding:.75rem 2rem;background:rgba(59,130,246,.2);border:1px solid rgba(59,130,246,.3);color:rgba(96,165,250,1);text-decoration:none;border-radius:.75rem;font-weight:600;font-size:.875rem;transition:all .2s}
.cta:hover{background:rgba(59,130,246,.3)}
.glass{margin:1.5rem 0;padding:1.5rem;background:rgba(255,255,255,.05);backdrop-filter:blur(20px);border:1px solid rgba(255,255,255,.1);border-radius:1rem;box-shadow:0 8px 32px rgba(0,0,0,.3)}
h2{font-size:1.2rem;font-weight:600;color:rgba(255,255,255,.9);margin-bottom:1rem}
p{margin:.5rem 0;color:rgba(255,255,255,.5);font-size:.9rem}
p strong{color:rgba(255,255,255,.8)}
table{width:100%;border-collapse:collapse;margin:.75rem 0}
td,th{padding:.75rem;text-align:left;border-bottom:1px solid rgba(255,255,255,.06);vertical-align:top;font-size:.875rem}
th{width:30%;font-weight:600;white-space:nowrap;color:rgba(255,255,255,.7)}
td{color:rgba(255,255,255,.45)}
.footer{text-align:center;margin-top:3rem;padding-top:1.5rem;border-top:1px solid rgba(255,255,255,.06);font-size:.85rem;color:rgba(255,255,255,.35)}
.footer a{color:rgba(96,165,250,.8);text-decoration:none}
.footer a:hover{color:rgba(96,165,250,1)}
.footer p+p{margin-top:.25rem}
@media(max-width:480px){.container{padding:1.5rem .75rem}h1{font-size:1.5rem}.glass{padding:1.25rem}}
</style>
</head>
<body>
<div class="container">

<div class="hero">
  <div class="badge">
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg>
    Encrypted Storage &bull; AES-256-GCM &bull; Open Source
  </div>
  <h1>PayMe.tw 專用安全短連結</h1>
  <p class="subtitle">你的連結經加密後只存密文，金鑰只在你手中。12 小時後，一切自動消失。</p>
  <a class="cta" href="https://payme.tw">前往 PayMe.tw &rarr;</a>
</div>

<div class="glass">
  <h2>為什麼不用別人的縮網址？</h2>
  <p>當你使用第三方縮網址服務，你的分帳連結（包含銀行帳號與金額）會完整交給對方的伺服器。</p>
  <p><strong>s.payme.tw 是 PayMe.tw 的自建短連結服務。</strong>你的資料不會流向任何第三方，而且我們的伺服器本身也讀不懂你的內容。</p>
</div>

<div class="glass">
  <h2>密文儲存架構</h2>
  <p>伺服器只保管密文，解密金鑰只在你的連結裡。沒有金鑰，密文無法還原。</p>
  <table>
    <tr><th>密文儲存</th><td>伺服器只儲存加密後的密文。解密金鑰（ClientKey）藏在網址 # 之後，只有你和收到連結的人持有。</td></tr>
    <tr><th>AES-256-GCM</th><td>與銀行同等級的對稱式加密標準。你的分帳資料在離開瀏覽器之前就已加密。</td></tr>
    <tr><th>URL Hash 隔離</th><td>ClientKey 存在網址的 # 之後。根據 HTTP 協議，# 後面的內容不會被瀏覽器傳送至伺服器。</td></tr>
    <tr><th>12 小時閱後即焚</th><td>所有資料在建立後 12 小時由 Cloudflare 基礎設施自動銷毀。時間到了，物理消失。</td></tr>
    <tr><th>完整開源</th><td>不要相信我們的話 — 看我們的程式碼。加密邏輯、伺服器邏輯全部公開。</td></tr>
  </table>
</div>

<div class="glass">
  <h2>技術規格</h2>
  <table>
    <tr><th>加密演算法</th><td>AES-256-GCM</td></tr>
    <tr><th>金鑰衍生</th><td>HKDF-SHA256（ClientKey）</td></tr>
    <tr><th>ClientKey 傳輸</th><td>URL Fragment（# 後），不經過伺服器</td></tr>
    <tr><th>資料存活時間</th><td>12 小時（Cloudflare KV TTL）</td></tr>
    <tr><th>執行環境</th><td>Cloudflare Workers（邊緣運算）</td></tr>
    <tr><th>適用範圍</th><td>僅限 PayMe.tw 分帳連結</td></tr>
  </table>
</div>

<div class="footer">
  <p><strong>s.payme.tw</strong> 是 <a href="https://payme.tw">PayMe.tw</a> 的子專案。</p>
  <p>完整程式碼公開於 <a href="https://github.com/JTH58/payme-shortener">github.com/JTH58/payme-shortener</a>。</p>
  <p>不要相信我們，驗證我們。</p>
</div>

</div>
</body>
</html>`;
}
