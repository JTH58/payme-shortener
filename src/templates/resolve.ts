import { LinkMode } from "../types";

const OG_META: Record<LinkMode, { title: string; description: string; image: string }> = {
  simple: {
    title: "PayMe.TW 收款",
    description: "點擊連結查看詳細金額並進行轉帳。",
    image: "https://payme.tw/og-simple.jpg",
  },
  bill: {
    title: "PayMe.TW 分帳",
    description: "點擊連結查看帳單細項，認領屬於您的消費項目。",
    image: "https://payme.tw/og-bill.jpg",
  },
};

export function renderResolvePage(
  ciphertext: string,
  serverKey: string,
  mode: LinkMode = "simple"
): string {
  const og = OG_META[mode];
  return `<!DOCTYPE html>
<html lang="zh-TW">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${og.title} — PayMe.tw</title>
<meta name="description" content="${og.description}">
<meta property="og:type" content="website">
<meta property="og:title" content="${og.title}">
<meta property="og:description" content="${og.description}">
<meta property="og:image" content="${og.image}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:site_name" content="PayMe.tw">
<meta property="og:locale" content="zh_TW">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${og.title}">
<meta name="twitter:description" content="${og.description}">
<meta name="twitter:image" content="${og.image}">
<link rel="icon" href="https://payme.tw/favicon.ico">
<link rel="apple-touch-icon" href="https://payme.tw/apple-icon.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Inter',system-ui,-apple-system,sans-serif;color:rgba(255,255,255,.87);background:#020617;min-height:100vh;display:flex;align-items:center;justify-content:center;overflow:hidden}
body::before{content:'';position:fixed;top:-200px;left:50%;transform:translateX(-50%);width:800px;height:600px;background:rgba(59,130,246,.1);border-radius:50%;filter:blur(120px);pointer-events:none}
.card{position:relative;z-index:1;text-align:center;max-width:400px;width:90%;padding:2.5rem 2rem;background:rgba(255,255,255,.05);backdrop-filter:blur(20px);border:1px solid rgba(255,255,255,.1);border-radius:1.25rem;box-shadow:0 8px 32px rgba(0,0,0,.3)}
.icon{width:64px;height:64px;margin:0 auto 1.5rem;border-radius:1rem;animation:pulse 2s ease-in-out infinite}
@keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.7;transform:scale(.95)}}
@keyframes spin{to{transform:rotate(360deg)}}
.spinner{width:32px;height:32px;margin:1.5rem auto;border:3px solid rgba(255,255,255,.1);border-top-color:rgba(96,165,250,.8);border-radius:50%;animation:spin .8s linear infinite}
h1{font-size:1.4rem;font-weight:700;color:rgba(255,255,255,.9);margin-bottom:.5rem}
p{color:rgba(255,255,255,.4);font-size:.9rem;margin:.25rem 0;line-height:1.5}
.status{color:rgba(96,165,250,.8);font-size:.8rem;font-weight:500;letter-spacing:.1em;text-transform:uppercase;margin-top:.5rem}
.btn{display:inline-block;margin-top:1.5rem;padding:.625rem 1.5rem;background:rgba(59,130,246,.2);border:1px solid rgba(59,130,246,.3);color:rgba(96,165,250,1);text-decoration:none;border-radius:.625rem;font-weight:500;font-size:.875rem;transition:all .2s}
.btn:hover{background:rgba(59,130,246,.3)}
.error-icon{font-size:2.5rem;margin-bottom:1rem}
</style>
</head>
<body>
<div class="card" id="app">
  <img class="icon" src="https://payme.tw/icon-splash-128.png" alt="PayMe.tw">
  <div class="spinner"></div>
  <p class="status">Decrypting</p>
</div>
<script>
(function() {
  var CIPHERTEXT = "${ciphertext}";
  var SERVER_KEY = "${serverKey}";

  function base64urlDecode(str) {
    var padded = str.replace(/-/g, '+').replace(/_/g, '/');
    var binStr = atob(padded);
    var bytes = new Uint8Array(binStr.length);
    for (var i = 0; i < binStr.length; i++) bytes[i] = binStr.charCodeAt(i);
    return bytes;
  }

  async function deriveFullKey(clientKey, serverKeyB64) {
    var enc = new TextEncoder();
    var serverKeyBytes = base64urlDecode(serverKeyB64);
    var ikm = new Uint8Array(enc.encode(clientKey).length + serverKeyBytes.length);
    ikm.set(enc.encode(clientKey));
    ikm.set(serverKeyBytes, enc.encode(clientKey).length);
    var rawKey = await crypto.subtle.importKey('raw', ikm, 'HKDF', false, ['deriveKey']);
    return crypto.subtle.deriveKey(
      { name: 'HKDF', hash: 'SHA-256', salt: enc.encode('payme-shortener-v1'), info: enc.encode('aes-256-gcm') },
      rawKey,
      { name: 'AES-GCM', length: 256 },
      false,
      ['decrypt']
    );
  }

  async function decrypt(ciphertextB64, key) {
    var combined = base64urlDecode(ciphertextB64);
    var iv = combined.slice(0, 12);
    var ct = combined.slice(12);
    var plaintext = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: iv }, key, ct);
    return new TextDecoder().decode(plaintext);
  }

  var app = document.getElementById('app');
  var hash = location.hash.slice(1);
  var clientKeyMatch = hash.match(/^[A-Za-z0-9]{4}/);

  if (!clientKeyMatch) {
    app.innerHTML = '<div class="error-icon">&#128279;</div><h1>連結不完整</h1><p>請確認連結是否正確</p><a class="btn" href="https://payme.tw">前往 PayMe.tw</a>';
    return;
  }

  var clientKey = clientKeyMatch[0];

  deriveFullKey(clientKey, SERVER_KEY)
    .then(function(key) { return decrypt(CIPHERTEXT, key); })
    .then(function(url) { location.href = url; })
    .catch(function() {
      app.innerHTML = '<div class="error-icon">&#128683;</div><h1>連結無效或已損壞</h1><p>解密失敗，連結可能已被竄改。</p><a class="btn" href="https://payme.tw">前往 PayMe.tw</a>';
    });
})();
</script>
</body>
</html>`;
}
