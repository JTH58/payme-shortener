export function renderExpiredPage(): string {
  return `<!DOCTYPE html>
<html lang="zh-TW">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>連結已過期 — s.payme.tw</title>
<meta name="description" content="此短連結已過期。PayMe.tw 短連結有效期為 12 小時。">
<meta property="og:type" content="website">
<meta property="og:title" content="連結已過期 — s.payme.tw">
<meta property="og:description" content="此短連結已過期，請向對方索取新連結。">
<meta property="og:image" content="https://payme.tw/og-simple.jpg">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:site_name" content="PayMe.tw">
<meta property="og:locale" content="zh_TW">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="連結已過期 — s.payme.tw">
<meta name="twitter:description" content="此短連結已過期，請向對方索取新連結。">
<meta name="twitter:image" content="https://payme.tw/og-simple.jpg">
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
.icon{font-size:3rem;margin-bottom:1.25rem}
h1{font-size:1.4rem;font-weight:700;color:rgba(255,255,255,.9);margin-bottom:.75rem}
p{color:rgba(255,255,255,.4);font-size:.9rem;line-height:1.5}
.btn{display:inline-block;margin-top:1.75rem;padding:.625rem 1.5rem;background:rgba(59,130,246,.2);border:1px solid rgba(59,130,246,.3);color:rgba(96,165,250,1);text-decoration:none;border-radius:.625rem;font-weight:500;font-size:.875rem;transition:all .2s}
.btn:hover{background:rgba(59,130,246,.3)}
</style>
</head>
<body>
<div class="card">
  <div class="icon">&#128344;</div>
  <h1>此連結已過期</h1>
  <p>短連結有效期為 12 小時，此連結已自動銷毀。<br>請向對方索取新連結。</p>
  <a class="btn" href="https://payme.tw">前往 PayMe.tw</a>
</div>
</body>
</html>`;
}
