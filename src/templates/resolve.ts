export function renderResolvePage(
  ciphertext: string,
  serverKey: string
): string {
  return `<!DOCTYPE html>
<html lang="zh-TW">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>s.payme.tw</title>
</head>
<body>
<div id="app"></div>
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
    app.innerHTML = '<h1>連結不完整</h1><p>請確認連結是否正確</p><a href="https://payme.tw">前往 PayMe.tw</a>';
    return;
  }

  var clientKey = clientKeyMatch[0];
  app.innerHTML = '<p>解密中...</p>';

  deriveFullKey(clientKey, SERVER_KEY)
    .then(function(key) { return decrypt(CIPHERTEXT, key); })
    .then(function(url) { location.href = url; })
    .catch(function() {
      app.innerHTML = '<h1>連結無效或已損壞</h1><p>解密失敗，連結可能已被竄改。</p><a href="https://payme.tw">前往 PayMe.tw</a>';
    });
})();
</script>
</body>
</html>`;
}
