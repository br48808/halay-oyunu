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
    io.emit('halayaKatil', {
        isim: isim,
        resim: 'https://dicebear.com' + no
    });
    io.emit('yorumGeldi', {
        isim: isim,
        resim: 'https://dicebear.com' + no,
        mesaj: 'Halaya geldim!'
    });
    res.send('Test oyuncusu eklendi! TikTok LIVE Studio ekranina bakin.');
});

app.get('/test-hediye', (req, res) => {
    const no = Math.floor(Math.random() * 100);
    io.emit('halayBasiYap', {
        isim: 'Kral_' + no,
        resim: 'https://dicebear.com' + no,
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
        'body { width: 100vw; height: 100vh; overflow: hidden; background: linear-gradient(180deg, #e7d8c1 0%, #d5be9e 40%, #bfa17a 100%); position: relative; }',
        /* Üst Liderlik Tablosu (Görseldeki gibi Top 5) */
        '#liderler { position: absolute; top: 18px; left: 50%; transform: translateX(-50%); display: flex; gap: 10px; z-index: 200; width: 94vw; justify-content: center; }',
        '.lider-kutu { background: rgba(25, 20, 15, 0.85); border: 2px solid #f59e0b; border-radius: 25px; padding: 4px 10px 4px 4px; display: flex; align-items: center; gap: 6px; color: white; box-shadow: 0 4px 10px rgba(0,0,0,0.4); }',
        '.lider-kutu img { width: 32px; height: 32px; border-radius: 50%; border: 2px solid gold; }',
        '.lider-bilgi { display: flex; flex-direction: column; font-size: 10px; line-height: 1.2; }',
        '.lider-isim { font-weight: bold; max-width: 55px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }',
        '.lider-jeton { color: #fbbf24; font-weight: 800; }',
        /* Arka Plan Kemerli Mimari ve 3D Meydan */
        '.kemerler { position: absolute; top: 75px; width: 100%; height: 90px; background: repeating-linear-gradient(90deg, #8c6d46 0px, #8c6d46 40px, #5c4326 40px, #5c4326 80px); opacity: 0.35; border-bottom: 6px solid #785a36; }',
        '#meydan { position: absolute; top: 54%; left: 50%; transform: translate(-50%, -50%); width: 94vw; height: 56vh; border-radius: 50%; background: radial-gradient(circle, #f7efe2 0%, #e6d5bc 65%, #cbb28e 95%, #a88b63 100%); border: 8px solid #f5ebd9; box-shadow: 0 25px 50px rgba(60, 40, 20, 0.45), inset 0 0 40px rgba(130, 95, 55, 0.3); }',
        /* Tam Ortadaki 3D Davul-Zurna Platformu */
        '#merkez-platform { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 150px; height: 110px; background: linear-gradient(145deg, #2b2118, #140f0a); border-radius: 24px; border: 4px solid #d97706; box-shadow: 0 18px 30px rgba(0,0,0,0.6), inset 0 0 15px #f59e0b; display: flex; flex-direction: column; align-items: center; justify-content: center; color: #fde68a; z-index: 50; animation: davulRitim 0.45s infinite alternate; }',
        '@keyframes davulRitim { from { transform: translate(-50%, -50%) scale(1); } to { transform: translate(-50%, -50%) scale(1.06); } }',
        '.davul-ikon { font-size: 36px; filter: drop-shadow(0 4px 6px rgba(0,0,0,0.8)); }',
        '.meydan-yazi { font-size: 11px; font-weight: 900; letter-spacing: 0.5px; color: #fbbf24; margin-top: 4px; text-align: center; }',
        /* 3D Minyatür İnsan Karakteri */
        '.karakter { position: absolute; display: flex; flex-direction: column; align-items: center; transform: translate(-50%, -85%); transition: left 0.15s linear, top 0.15s linear; animation: adimAt 0.45s infinite alternate ease-in-out; }',
        '@keyframes adimAt { 0% { transform: translate(-50%, -85%) translateY(0px) rotate(-3deg); } 100% { transform: translate(-50%, -85%) translateY(-10px) rotate(3deg); } }',
        /* Konuşma Balonu */
        '.balon { background: white; color: #111; padding: 4px 10px; border-radius: 12px; font-size: 12px; font-weight: 800; max-width: 150px; text-align: center; box-shadow: 0 4px 12px rgba(0,0,0,0.35); margin-bottom: 4px; position: relative; border: 1px solid #ddd; }',
        /* Görseldeki Gibi Seviyeli İsim Etiketi */
        '.etiket-kutu { background: rgba(20, 20, 20, 0.88); color: white; font-size: 11px; font-weight: 700; padding: 2px 7px; border-radius: 12px; margin-bottom: 3px; display: flex; align-items: center; gap: 4px; box-shadow: 0 2px 6px rgba(0,0,0,0.4); white-space: nowrap; }',
        '.rozet { background: #ec4899; color: white; font-size: 9px; padding: 1px 5px; border-radius: 8px; font-weight: 900; }',
        /* Kafa, 3D Gövde ve Bacaklar */
        '.kafa { width: 38px; height: 38px; border-radius: 50%; border: 2.5px solid white; object-fit: cover; box-shadow: 0 3px 6px rgba(0,0,0,0.4); z-index: 3; background: #333; }',
        '.govde { width: 28px; height: 32px; border-radius: 10px 10px 4px 4px; margin-top: -4px; position: relative; box-shadow: inset -4px -4px 8px rgba(0,0,0,0.35), 0 4px 6px rgba(0,0,0,0.3); z-index: 2; }',
        '.kol-sol, .kol-sag { position: absolute; top: 5px; width: 18px; height: 6px; border-radius: 4px; background: inherit; }',
        '.kol-sol { left: -14px; transform: rotate(-25deg); }',
        '.kol-sag { right: -14px; transform: rotate(25deg); }',
        '.bacaklar { display: flex; gap: 5px; margin-top: -2px; z-index: 1; }',
        '.bacak { width: 8px; height: 16px; background: #1e293b; border-radius: 0 0 4px 4px; }',
        '.golge { width: 34px; height: 10px; background: rgba(0,0,0,0.3); border-radius: 50%; margin-top: -3px; filter: blur(1px); }',
        /* Halay Başı Özel 3D Görünüm */
        '.halay-basi .kafa { width: 48px; height: 48px; border: 3px solid #fbbf24; box-shadow: 0 0 15px #fbbf24; }',
        '.halay-basi .govde { width: 34px; height: 38px; }',
        '.mendil { position: absolute; right: -28px; top: -14px; font-size: 24px; animation: mendilSalla 0.3s infinite alternate; }',
        '@keyframes mendilSalla { from { transform: rotate(-20deg); } to { transform: rotate(25deg); } }',
        /* Alt Bilgi Çubuğu */
        '#alt-bar { position: absolute; bottom: 20px; left: 50%; transform: translateX(-50%); background: rgba(20, 15, 10, 0.88); color: #fde68a; padding: 10px 24px; border-radius: 30px; font-size: 16px; font-weight: 800; border: 2px solid #f59e0b; white-space: nowrap; box-shadow: 0 8px 20px rgba(0,0,0,0.5); z-index: 200; }',
        '</style>',
        '</head>',
        '<body>',
        '<div id="liderler"></div>',
        '<div class="kemerler"></div>',
        '<div id="meydan">',
        '  <div id="merkez-platform">',
        '    <div class="davul-ikon">🥁🎶</div>',
        '    <div class="meydan-yazi">HALAY MEYDANI<br>"halay" yaz katıl!</div>',
        '  </div>',
        '</div>',
        '<div id="alt-bar">👑 Halay Başı bekleniyor... (Hediye at!)</div>',
        '<script src="/socket.io/socket.io.js"></script>',
        '<script>',
        'const socket = io();',
        'const meydan = document.getElementById("meydan");',
        'const altBar = document.getElementById("alt-bar");',
        'const liderlerDiv = document.getElementById("liderler");',
        'const renkler = ["#dc2626", "#2563eb", "#16a34a", "#9333ea", "#ea580c", "#0d9488", "#e11d48"];',
        'let oyuncular = [];',
        'let liderSkorlari = {};',
        'let donusAcisi = 0;',
        'function halkayiGuncelle() {',
        '  donusAcisi += 0.006;',
        '  const merkezX = meydan.offsetWidth / 2;',
        '  const merkezY = meydan.offsetHeight / 2;',
        '  const yaricapX = merkezX * 0.80;',
        '  const yaricapY = merkezY * 0.76;',
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
