const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const { WebcastPushConnection } = require('tiktok-live-connector');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Canlı yayın yapacağınız hesabın kullanıcı adı (@ olmadan)
const tiktokUsername = "br48808"; 
let tiktok = new WebcastPushConnection(tiktokUsername);

tiktok.connect().catch(err => console.log("Yayın bekleniyor..."));

// Yorumları dinle
tiktok.on('chat', data => {
    const mesaj = data.comment;
    io.emit('yorumGeldi', {
        isim: data.uniqueId,
        resim: data.profilePictureUrl,
        mesaj: mesaj
    });

    if (mesaj.toLowerCase().includes('halay') || mesaj.toLowerCase().includes('katıl')) {
        io.emit('halayaKatil', {
            isim: data.uniqueId,
            resim: data.profilePictureUrl
        });
    }
});

// Hediyeleri dinle
tiktok.on('gift', data => {
    if (data.giftType === 1 && !data.repeatEnd) return;
    const jeton = (data.diamondCount || 1) * (data.repeatCount || 1);
    io.emit('halayBasiYap', {
        isim: data.uniqueId,
        resim: data.profilePictureUrl,
        jeton: jeton
    });
});

// TEST LİNKLERİ
app.get('/test-katil', (req, res) => {
    const no = Math.floor(Math.random() * 100);
    const isim = 'Izleyici_' + no;
    const avatarUrl = 'https://dicebear.com' + no;
    io.emit('halayaKatil', { isim: isim, resim: avatarUrl });
    io.emit('yorumGeldi', { isim: isim, resim: avatarUrl, mesaj: 'Osimhen ile halay!' });
    res.send('Test oyuncusu eklendi! TikTok LIVE Studio ekranina bakin.');
});

app.get('/test-hediye', (req, res) => {
    const no = Math.floor(Math.random() * 100);
    const avatarUrl = 'https://dicebear.com' + no;
    io.emit('halayBasiYap', {
        isim: 'Kral_' + no,
        resim: avatarUrl,
        jeton: Math.floor(Math.random() * 50) + 10
    });
    res.send('Test Halay Basi eklendi! TikTok LIVE Studio ekranina bakin.');
});

app.get('/', (req, res) => {
    const html = [
        '<!DOCTYPE html>',
        '<html lang="tr">',
        '<head>',
        '<meta charset="UTF-8">',
        '<style>',
        '* { box-sizing: border-box; margin: 0; padding: 0; font-family: "Segoe UI", sans-serif; }',
        'body { width: 100vw; height: 100vh; overflow: hidden; background: radial-gradient(circle at 50% 45%, #1e293b 0%, #0f172a 60%, #020617 100%); position: relative; }',
        /* Stadyum Işık Efekti */
        '.stadyum-isik { position: absolute; top: -50px; left: 50%; transform: translateX(-50%); width: 120vw; height: 45vh; background: radial-gradient(ellipse at top, rgba(251, 191, 36, 0.25) 0%, rgba(220, 38, 38, 0.1) 50%, transparent 80%); pointer-events: none; }',
        /* Üst Liderlik Tablosu */
        '#liderler { position: absolute; top: 18px; left: 50%; transform: translateX(-50%); display: flex; gap: 10px; z-index: 200; width: 94vw; justify-content: center; }',
        '.lider-kutu { background: rgba(15, 23, 42, 0.9); border: 2px solid #f59e0b; border-radius: 25px; padding: 4px 10px 4px 4px; display: flex; align-items: center; gap: 6px; color: white; box-shadow: 0 4px 12px rgba(0,0,0,0.6); }',
        '.lider-kutu img { width: 32px; height: 32px; border-radius: 50%; border: 2px solid gold; }',
        '.lider-bilgi { display: flex; flex-direction: column; font-size: 10px; line-height: 1.2; }',
        '.lider-isim { font-weight: bold; max-width: 55px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }',
        '.lider-jeton { color: #fbbf24; font-weight: 800; }',
        /* Çim Saha & 3D Halay Meydanı */
        '#meydan { position: absolute; top: 54%; left: 50%; transform: translate(-50%, -50%); width: 94vw; height: 58vh; border-radius: 50%; background: radial-gradient(circle, #16a34a 0%, #15803d 55%, #166534 85%, #14532d 100%); border: 8px solid #fef08a; box-shadow: 0 25px 60px rgba(0,0,0,0.8), inset 0 0 50px rgba(0,0,0,0.5); }',
        '#meydan::before { content: ""; position: absolute; top: 15%; left: 15%; width: 70%; height: 70%; border-radius: 50%; border: 3px solid rgba(255,255,255,0.25); pointer-events: none; }',
        /* TAM ORTADAKİ GERÇEKÇİ OSİMHEN SAHNESİ */
        '#osimhen-sahne { position: absolute; top: 48%; left: 50%; transform: translate(-50%, -55%); display: flex; flex-direction: column; align-items: center; z-index: 60; animation: osimhenDans 0.45s infinite alternate ease-in-out; }',
        '@keyframes osimhenDans { 0% { transform: translate(-50%, -55%) translateY(0px) rotate(-2deg); } 100% { transform: translate(-50%, -55%) translateY(-12px) rotate(2deg); } }',
        '.osimhen-etiket { background: linear-gradient(90deg, #b91c1c, #f59e0b); color: white; font-size: 12px; font-weight: 900; padding: 3px 12px; border-radius: 12px; border: 1.5px solid white; box-shadow: 0 4px 10px rgba(0,0,0,0.7); margin-bottom: 4px; letter-spacing: 0.5px; }',
        '.osimhen-golge { width: 95px; height: 22px; background: rgba(0,0,0,0.55); border-radius: 50%; margin-top: -10px; filter: blur(3px); }',
        /* İzleyici Karakterleri */
        '.karakter { position: absolute; display: flex; flex-direction: column; align-items: center; transform: translate(-50%, -85%); transition: left 0.15s linear, top 0.15s linear; animation: adimAt 0.45s infinite alternate ease-in-out; }',
        '@keyframes adimAt { 0% { transform: translate(-50%, -85%) translateY(0px) rotate(-3deg); } 100% { transform: translate(-50%, -85%) translateY(-10px) rotate(3deg); } }',
        '.balon { background: white; color: #111; padding: 4px 10px; border-radius: 12px; font-size: 12px; font-weight: 800; max-width: 150px; text-align: center; box-shadow: 0 4px 12px rgba(0,0,0,0.4); margin-bottom: 4px; }',
        '.etiket-kutu { background: rgba(15, 23, 42, 0.9); color: white; font-size: 11px; font-weight: 700; padding: 2px 7px; border-radius: 12px; margin-bottom: 3px; display: flex; align-items: center; gap: 4px; box-shadow: 0 2px 6px rgba(0,0,0,0.5); white-space: nowrap; }',
        '.rozet { background: #dc2626; color: #fef08a; font-size: 9px; padding: 1px 5px; border-radius: 8px; font-weight: 900; }',
        '.kafa { width: 38px; height: 38px; border-radius: 50%; border: 2.5px solid white; object-fit: cover; box-shadow: 0 3px 6px rgba(0,0,0,0.5); z-index: 3; background: #333; }',
        '.govde { width: 28px; height: 32px; border-radius: 10px 10px 4px 4px; margin-top: -4px; position: relative; box-shadow: inset -4px -4px 8px rgba(0,0,0,0.4), 0 4px 6px rgba(0,0,0,0.4); z-index: 2; }',
        '.kol-sol, .kol-sag { position: absolute; top: 5px; width: 18px; height: 6px; border-radius: 4px; background: inherit; }',
        '.kol-sol { left: -14px; transform: rotate(-25deg); }',
        '.kol-sag { right: -14px; transform: rotate(25deg); }',
        '.bacaklar { display: flex; gap: 5px; margin-top: -2px; z-index: 1; }',
        '.bacak { width: 8px; height: 16px; background: #0f172a; border-radius: 0 0 4px 4px; }',
        '.golge { width: 34px; height: 10px; background: rgba(0,0,0,0.4); border-radius: 50%; margin-top: -3px; filter: blur(1px); }',
        '.halay-basi .kafa { width: 48px; height: 48px; border: 3px solid #fbbf24; box-shadow: 0 0 15px #fbbf24; }',
        '.halay-basi .govde { width: 34px; height: 38px; }',
        '.mendil { position: absolute; right: -28px; top: -14px; font-size: 24px; animation: mendilSalla 0.3s infinite alternate; }',
        '@keyframes mendilSalla { from { transform: rotate(-20deg); } to { transform: rotate(25deg); } }',
        '#alt-bar { position: absolute; bottom: 20px; left: 50%; transform: translateX(-50%); background: rgba(15, 23, 42, 0.92); color: #fde68a; padding: 10px 24px; border-radius: 30px; font-size: 15px; font-weight: 800; border: 2px solid #f59e0b; white-space: nowrap; box-shadow: 0 8px 25px rgba(0,0,0,0.7); z-index: 200; }',
        '</style>',
        '</head>',
        '<body>',
        '<div class="stadyum-isik"></div>',
        '<div id="liderler"></div>',
        '<div id="meydan">',
        '  <div id="osimhen-sahne">',
        '    <div class="osimhen-etiket">⚽ VICTOR OSIMHEN #45</div>',
        '    <svg width="115" height="175" viewBox="0 0 120 180">',
        '      <defs>',
        '        <radialGradient id="cilt" cx="40%" cy="35%" r="60%"><stop offset="0%" stop-color="#6d432b"/><stop offset="60%" stop-color="#472816"/><stop offset="100%" stop-color="#29150a"/></radialGradient>',
        '        <linearGradient id="sariForma" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#facc15"/><stop offset="100%" stop-color="#ca8a04"/></linearGradient>',
        '        <linearGradient id="kirmiziForma" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#dc2626"/><stop offset="100%" stop-color="#7f1d1d"/></linearGradient>',
        '        <linearGradient id="sac" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#fef08a"/><stop offset="100%" stop-color="#eab308"/></linearGradient>',
        '      </defs>',
        '      <!-- Kollar (Halay Pozisyonu) -->',
        '      <path d="M35 68 Q12 62 6 48" stroke="url(#cilt)" stroke-width="11" stroke-linecap="round" fill="none"/>',
        '      <path d="M85 68 Q108 62 114 48" stroke="url(#cilt)" stroke-width="11" stroke-linecap="round" fill="none"/>',
        '      <!-- Beyaz Mendil (Osimhen Elinde) -->',
        '      <path d="M114 48 Q120 25 108 18 Q102 35 114 48" fill="#ffffff" stroke="#e2e8f0" stroke-width="1"/>',
        '      <!-- Bacaklar ve Kramponlar -->',
        '      <rect x="42" y="128" width="13" height="36" rx="5" fill="url(#cilt)"/>',
        '      <rect x="65" y="128" width="13" height="36" rx="5" fill="url(#cilt)"/>',
        '      <rect x="42" y="144" width="13" height="18" fill="#b91c1c"/>',
        '      <rect x="65" y="144" width="13" height="18" fill="#facc15"/>',
        '      ',
'      ',
'      ',
'      ',
'      ',
'      ',
'      ',
'      ',
'      ',
'      ',
'      ',
'      ',
'      45',
'      ',
'      ',
'      ',
'      ',
'      ',
'      ',
'      ',
'      ',
'      ',
'      ',
'      ',
'      ',
'      ',
'    ',
'    ',
'  ',
'',
'⚽ "halay" yaz Osimhen ile halaya katıl • Hediye at Halay Başı ol!',
'',
'',
'const socket = io();',
'const meydan = document.getElementById("meydan");',
'const altBar = document.getElementById("alt-bar");',
'const liderlerDiv = document.getElementById("liderler");',
'const renkler = ["#dc2626", "#facc15", "#16a34a", "#2563eb", "#ea580c", "#9333ea"];',
'let oyuncular = [];',
'let liderSkorlari = {};',
'let donusAcisi = 0;',
'function halkayiGuncelle() {',
'  donusAcisi += 0.006;',
'  const merkezX = meydan.offsetWidth / 2;',
'  const merkezY = meydan.offsetHeight / 2;',
'  const yaricapX = merkezX * 0.82;',
'  const yaricapY = merkezY * 0.78;',
'  oyuncular.forEach((oyuncu, index) => {',
'    const el = document.getElementById("oyuncu-" + oyuncu.isim);',
'    if (!el) return;',
'    const aci = donusAcisi + (index * (2 * Math.PI / oyuncular.length));',
'    const x = merkezX + yaricapX * Math.cos(aci);',
'    const y = merkezY + yaricapY * Math.sin(aci);',
'    el.style.left = x + "px";',
'    el.style.top = y + "px";',
'    el.style.zIndex = Math.floor(y);',
'  });',
'  requestAnimationFrame(halkayiGuncelle);',
'}',
'requestAnimationFrame(halkayiGuncelle);',
'function liderleriGuncelle(isim, resim, jeton) {',
'  if (!liderSkorlari[isim]) liderSkorlari[isim] = { isim: isim, resim: resim, jeton: 0 };',
'  liderSkorlari[isim].jeton += jeton;',
'  const sirali = Object.values(liderSkorlari).sort((a, b) => b.jeton - a.jeton).slice(0, 4);',
'  liderlerDiv.innerHTML = sirali.map(l => "<div class=\"lider-kutu\"><img src=\"" + l.resim + "\"><div class=\"lider-bilgi\"><span class=\"lider-isim\">" + l.isim + "<span class=\"lider-jeton\">🪙 " + l.jeton + " jeton").join("");',
'}',
'function oyuncuEkle(data, basiMi) {',
'  let mevcut = oyuncular.find(o => o.isim === data.isim);',
'  const kiyafetRengi = basiMi ? "#f59e0b" : renkler[Math.floor(Math.random() * renkler.length)];',
'  const seviye = basiMi ? "7/7" : (Math.floor(Math.random() * 5) + 1) + "/7";',
'  if (mevcut) {',
'    if (basiMi) {',
'      oyuncular = oyuncular.filter(o => o.isim !== data.isim);',
'      oyuncular.unshift({ isim: data.isim, resim: data.resim, basiMi: true });',
'      const eskiEl = document.getElementById("oyuncu-" + data.isim);',
'      if (eskiEl) eskiEl.remove();',
'    } else { return; }',
'  } else {',
'    if (basiMi) { oyuncular.unshift({ isim: data.isim, resim: data.resim, basiMi: true }); }',
'    else { oyuncular.push({ isim: data.isim, resim: data.resim, basiMi: false }); }',
'  }',
'  if (oyuncular.length > 28) {',
'    const cikan = oyuncular.pop();',
'    const cikanEl = document.getElementById("oyuncu-" + cikan.isim);',
'    if (cikanEl) cikanEl.remove();',
'  }',
'  const div = document.createElement("div");',
'  div.id = "oyuncu-" + data.isim;',
'  div.className = basiMi ? "karakter halay-basi" : "karakter";',
'  const mendil = basiMi ? "<span class=\"mendil\">🧣" : "";',
'  div.innerHTML = "<div class=\"etiket-kutu\">" + data.isim + "<span class=\"rozet\">" + seviye + "" +',
'                  "<img class=\"kafa\" src=\"" + data.resim + "\">" +',
'                  "<div class=\"govde\" style=\"background:" + kiyafetRengi + "\"><div class=\"kol-sol\"><div class=\"kol-sag\">" + mendil + "" +',
'                  "<div class=\"bacaklar\"><div class=\"bacak\"><div class=\"bacak\">" +',
'                  "<div class=\"golge\">";',
'  meydan.appendChild(div);',
'  if (basiMi) {',
'    altBar.innerText = "👑 " + data.isim + " Halay Başı Oldu! 👑";',
'    liderleriGuncelle(data.isim, data.resim, data.jeton || 10);',
'  }',
'}',
'function balonGoster(isim, mesaj) {',
'  const el = document.getElementById("oyuncu-" + isim);',
'  if (!el) return;',
'  const eskiBalon = el.querySelector(".balon");',
'  if (eskiBalon) eskiBalon.remove();',
'  const balon = document.createElement("div");',
'  balon.className = "balon";',
'  balon.innerText = mesaj;',
'  el.prepend(balon);',
'  setTimeout(() => { if (balon) balon.remove(); }, 5000);',
'}',
'socket.on("halayaKatil", d => oyuncuEkle(d, false));',
'socket.on("halayBasiYap", d => oyuncuEkle(d, true));',
'socket.on("yorumGeldi", d => balonGoster(d.isim, d.mesaj));',
'',
'',
''
].join('\n');
res.send(html);
});
server.listen(process.env.PORT || 3000);
