const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const { WebcastPushConnection } = require('tiktok-live-connector');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const tiktokUsername = "br48808"; 
let tiktok = new WebcastPushConnection(tiktokUsername);

tiktok.connect().catch(err => console.log("Yayın bekleniyor..."));

const sehirListesi = [
    { plaka: "01", ad: "Adana" }, { plaka: "02", ad: "Adıyaman" }, { plaka: "03", ad: "Afyonkarahisar" },
    { plaka: "04", ad: "Ağrı" }, { plaka: "05", ad: "Amasya" }, { plaka: "06", ad: "Ankara" },
    { plaka: "07", ad: "Antalya" }, { plaka: "08", ad: "Artvin" }, { plaka: "09", ad: "Aydın" },
    { plaka: "10", ad: "Balıkesir" }, { plaka: "11", ad: "Bilecik" }, { plaka: "12", ad: "Bingöl" },
    { plaka: "13", ad: "Bitlis" }, { plaka: "14", ad: "Bolu" }, { plaka: "15", ad: "Burdur" },
    { plaka: "16", ad: "Bursa" }, { plaka: "17", ad: "Çanakkale" }, { plaka: "18", ad: "Çankırı" },
    { plaka: "19", ad: "Çorum" }, { plaka: "20", ad: "Denizli" }, { plaka: "21", ad: "Diyarbakır" },
    { plaka: "22", ad: "Edirne" }, { plaka: "23", ad: "Elazığ" }, { plaka: "24", ad: "Erzincan" },
    { plaka: "25", ad: "Erzurum" }, { plaka: "26", ad: "Eskişehir" }, { plaka: "27", ad: "Gaziantep" },
    { plaka: "28", ad: "Giresun" }, { plaka: "29", ad: "Gümüşhane" }, { plaka: "30", ad: "Hakkari" },
    { plaka: "31", ad: "Hatay" }, { plaka: "32", ad: "Isparta" }, { plaka: "33", ad: "Mersin" },
    { plaka: "34", ad: "İstanbul" }, { plaka: "35", ad: "İzmir" }, { plaka: "36", ad: "Kars" },
    { plaka: "37", ad: "Kastamonu" }, { plaka: "38", ad: "Kayseri" }, { plaka: "39", ad: "Kırklareli" },
    { plaka: "40", ad: "Kırşehir" }, { plaka: "41", ad: "Kocaeli" }, { plaka: "42", ad: "Konya" },
    { plaka: "43", ad: "Kütahya" }, { plaka: "44", ad: "Malatya" }, { plaka: "45", ad: "Manisa" },
    { plaka: "46", ad: "Kahramanmaraş" }, { plaka: "47", ad: "Mardin" }, { plaka: "48", ad: "Muğla" },
    { plaka: "49", ad: "Muş" }, { plaka: "50", ad: "Nevşehir" }, { plaka: "51", ad: "Niğde" },
    { plaka: "52", ad: "Ordu" }, { plaka: "53", ad: "Rize" }, { plaka: "54", ad: "Sakarya" },
    { plaka: "55", ad: "Samsun" }, { plaka: "56", ad: "Siirt" }, { plaka: "57", ad: "Sinop" },
    { plaka: "58", ad: "Sivas" }, { plaka: "59", ad: "Tekirdağ" }, { plaka: "60", ad: "Tokat" },
    { plaka: "61", ad: "Trabzon" }, { plaka: "62", ad: "Tunceli" }, { plaka: "63", ad: "Şanlıurfa" },
    { plaka: "64", ad: "Uşak" }, { plaka: "65", ad: "Van" }, { plaka: "66", ad: "Yozgat" },
    { plaka: "67", ad: "Zonguldak" }, { plaka: "68", ad: "Aksaray" }, { plaka: "69", ad: "Bayburt" },
    { plaka: "70", ad: "Karaman" }, { plaka: "71", ad: "Kırıkkale" }, { plaka: "72", ad: "Batman" },
    { plaka: "73", ad: "Şırnak" }, { plaka: "74", ad: "Bartın" }, { plaka: "75", ad: "Ardahan" },
    { plaka: "76", ad: "Iğdır" }, { plaka: "77", ad: "Yalova" }, { plaka: "78", ad: "Karabük" },
    { plaka: "79", ad: "Kilis" }, { plaka: "80", ad: "Osmaniye" }, { plaka: "81", ad: "Düzce" }
];

function sehirBul(metin) {
    const kucuk = metin.toLowerCase();
    for (let s of sehirListesi) {
        if (kucuk.includes(s.ad.toLowerCase())) return s;
    }
    const sayilar = metin.match(/\b\d{1,2}\b/g);
    if (sayilar) {
        for (let num of sayilar) {
            const p = num.padStart(2, '0');
            const bulunan = sehirListesi.find(s => s.plaka === p);
            if (bulunan) return bulunan;
        }
    }
    return sehirListesi[Math.floor(Math.random() * sehirListesi.length)];
}

tiktok.on('chat', data => {
    const mesaj = data.comment;
    const sehir = sehirBul(mesaj);
    io.emit('yorumGeldi', {
        isim: data.uniqueId,
        resim: data.profilePictureUrl,
        mesaj: mesaj,
        sehir: sehir
    });

    if (mesaj.toLowerCase().includes('halay') || mesaj.toLowerCase().includes('katıl') || /\b\d{1,2}\b/.test(mesaj)) {
        io.emit('halayaKatil', {
            isim: data.uniqueId,
            resim: data.profilePictureUrl,
            sehir: sehir
        });
    }
});

tiktok.on('gift', data => {
    if (data.giftType === 1 && !data.repeatEnd) return;
    const jeton = (data.diamondCount || 1) * (data.repeatCount || 1);
    const sehir = sehirListesi[Math.floor(Math.random() * sehirListesi.length)];
    io.emit('halayBasiYap', {
        isim: data.uniqueId,
        resim: data.profilePictureUrl,
        jeton: jeton,
        hediyeAdi: data.giftName || "Rose",
        adet: data.repeatCount || 1,
        sehir: sehir
    });
});

tiktok.on('like', data => {
    io.emit('begeniGeldi', data.likeCount || 5);
});

// TEST LİNKLERİ
app.get('/test-katil', (req, res) => {
    const no = Math.floor(Math.random() * 90) + 10;
    const isim = 'Elif' + no;
    const sehir = sehirListesi[Math.floor(Math.random() * sehirListesi.length)];
    const avatarUrl = 'https://dicebear.com' + no;
    io.emit('halayaKatil', { isim: isim, resim: avatarUrl, sehir: sehir });
    res.send('Test oyuncusu (' + sehir.plaka + ' ' + sehir.ad + ') halaya katıldı!');
});

app.get('/test-hediye', (req, res) => {
    const no = Math.floor(Math.random() * 90) + 10;
    const isim = 'Derya' + no;
    const sehir = sehirListesi[Math.floor(Math.random() * sehirListesi.length)];
    const avatarUrl = 'https://dicebear.com' + no;
    io.emit('halayBasiYap', {
        isim: isim,
        resim: avatarUrl,
        jeton: 25,
        hediyeAdi: 'Rose',
        adet: 5,
        sehir: sehir
    });
    res.send('Test hediyesi (' + sehir.plaka + ' ' + sehir.ad + ' +25 puan) gönderildi!');
});

app.get('/', (req, res) => {
    const html = [
        '<!DOCTYPE html>',
        '<html lang="tr">',
        '<head>',
        '<meta charset="UTF-8">',
        '<style>',
        '* { box-sizing: border-box; margin: 0; padding: 0; font-family: "Segoe UI", Tahoma, sans-serif; }',
        'body { width: 100vw; height: 100vh; overflow: hidden; background: radial-gradient(circle at 50% 45%, #3b2416 0%, #1c110a 55%, #090503 100%); position: relative; color: white; }',
        '.koy-arkaplan { position: absolute; top: 0; left: 0; width: 100%; height: 48%; background: linear-gradient(180deg, rgba(15,10,5,0.9) 0%, rgba(45,25,12,0.6) 60%, transparent 100%); border-bottom: 2px solid rgba(251,191,36,0.15); }',
        '.isik-teli { position: absolute; top: 185px; left: -5%; width: 110%; height: 40px; border-bottom: 3px dashed #fbbf24; border-radius: 50%; opacity: 0.75; filter: drop-shadow(0 0 8px #f59e0b); }',
        '.ust-banner { position: absolute; top: 14px; left: 50%; transform: translateX(-50%); width: 92vw; background: linear-gradient(180deg, #1f1916 0%, #0f0c0a 100%); border: 2px solid #eab308; border-radius: 14px; padding: 8px 12px; text-align: center; box-shadow: 0 6px 20px rgba(0,0,0,0.8); z-index: 300; }',
        '.ust-banner h1 { font-size: 17px; font-weight: 900; color: #fde047; text-shadow: 0 2px 4px rgba(0,0,0,0.9); }',
        '.ust-banner p { font-size: 13px; font-weight: 800; color: #ffffff; margin-top: 2px; }',
        '.lig-baslik { position: absolute; top: 76px; left: 50%; transform: translateX(-50%); width: 94vw; display: flex; justify-content: space-between; align-items: center; font-size: 12px; font-weight: 900; color: #fbbf24; text-shadow: 0 2px 4px black; z-index: 290; }',
        '.tur-kutu { background: rgba(0,0,0,0.75); border: 1px solid #d97706; padding: 2px 8px; border-radius: 8px; color: white; }',
        '#sehir-skorlar { position: absolute; top: 100px; left: 50%; transform: translateX(-50%); width: 95vw; display: flex; gap: 6px; justify-content: space-between; z-index: 290; }',
        '.sehir-kart { flex: 1; background: rgba(20, 15, 10, 0.9); border: 1.5px solid #f59e0b; border-radius: 8px; padding: 4px 6px; display: flex; justify-content: space-between; align-items: center; font-size: 11px; font-weight: 800; box-shadow: 0 4px 10px rgba(0,0,0,0.6); }',
        '.plaka { background: #2563eb; color: white; padding: 1px 4px; border-radius: 4px; font-size: 10px; margin-right: 3px; }',
        '.sehir-puan { color: #fde047; font-weight: 900; }',
        '.fark-bilgi { position: absolute; top: 132px; left: 50%; transform: translateX(-50%); width: 94vw; background: rgba(0,0,0,0.75); border-radius: 6px; padding: 3px 10px; text-align: center; font-size: 11px; font-weight: 800; color: #fef08a; border: 1px solid rgba(251,191,36,0.3); z-index: 290; }',
        '.barlar { position: absolute; top: 158px; left: 50%; transform: translateX(-50%); width: 94vw; display: flex; gap: 8px; z-index: 290; }',
        '.bar-kutu { flex: 1; background: rgba(0,0,0,0.8); border-radius: 10px; padding: 3px 6px; border: 1px solid #444; font-size: 9px; font-weight: 800; }',
        '.bar-doluluk { height: 5px; border-radius: 4px; margin-top: 2px; transition: width 0.3s; }',
        '#bildirim-alani { position: absolute; top: 192px; left: 50%; transform: translateX(-50%); width: 86vw; display: flex; flex-direction: column; gap: 6px; z-index: 280; pointer-events: none; }',
        '.bildirim-kart { background: linear-gradient(90deg, rgba(30,20,10,0.95) 0%, rgba(60,35,15,0.95) 100%); border: 2px solid #fbbf24; border-radius: 12px; padding: 6px 10px; display: flex; align-items: center; gap: 10px; box-shadow: 0 8px 20px rgba(0,0,0,0.8); animation: kartGiris 0.35s ease-out; }',
        '.bildirim-kart.katilim { border-color: #22c55e; background: linear-gradient(90deg, rgba(10,30,15,0.95) 0%, rgba(20,55,30,0.95) 100%); }',
        '@keyframes kartGiris { from { transform: translateY(-15px) scale(0.9); opacity: 0; } to { transform: translateY(0) scale(1); opacity: 1; } }',
        '.bildirim-kart img { width: 38px; height: 38px; border-radius: 50%; border: 2px solid gold; }',
        '.kart-detay { display: flex; flex-direction: column; font-size: 12px; }',
        '.kart-ust { font-weight: 900; color: #fde047; }',
'.kart-alt { font-size: 10px; font-weight: 800; color: #e2e8f0; margin-top: 2px; }',
'#meydan { position: absolute; top: 64%; left: 50%; transform: translate(-50%, -50%); width: 96vw; height: 50vh; border-radius: 50%; background: radial-gradient(circle, #78553a 0%, #4a3220 55%, #291a10 90%, #140c07 100%); border: 5px solid rgba(251, 191, 36, 0.5); box-shadow: 0 0 60px rgba(245, 158, 11, 0.35), inset 0 0 50px rgba(0,0,0,0.8); }',
'#sahne-platform { position: absolute; top: 48%; left: 50%; transform: translate(-50%, -50%); width: 175px; height: 115px; background: linear-gradient(180deg, #b45309 0%, #78350f 70%, #451a03 100%); border-radius: 16px; border: 3px solid #fde047; box-shadow: 0 20px 35px rgba(0,0,0,0.9), 0 0 25px rgba(251, 191, 36, 0.6); display: flex; flex-direction: column; align-items: center; justify-content: flex-end; padding-bottom: 6px; z-index: 60; }',
'#osimhen-kutu { position: absolute; bottom: 18px; display: flex; flex-direction: column; align-items: center; animation: ritimDans 0.45s infinite alternate; }',
'@keyframes ritimDans { from { transform: translateY(0) rotate(-2deg); } to { transform: translateY(-8px) rotate(2deg); } }',
'.sahne-tabela { background: #111; color: #fde047; font-size: 9px; font-weight: 900; padding: 2px 8px; border-radius: 6px; border: 1px solid #f59e0b; }',
'.karakter { position: absolute; display: flex; flex-direction: column; align-items: center; transform: translate(-50%, -85%); transition: left 0.15s linear, top 0.15s linear; animation: halayAdim 0.45s infinite alternate ease-in-out; }',
'@keyframes halayAdim { 0% { transform: translate(-50%, -85%) translateY(0px) rotate(-3deg); } 100% { transform: translate(-50%, -85%) translateY(-10px) rotate(3deg); } }',
'.etiket { background: rgba(15, 15, 15, 0.92); color: white; font-size: 10px; font-weight: 800; padding: 2px 6px; border-radius: 10px; margin-bottom: 2px; display: flex; align-items: center; gap: 3px; border: 1px solid rgba(255,255,255,0.2); white-space: nowrap; }',
'.etiket-plaka { background: #dc2626; color: #fef08a; font-size: 8px; padding: 0px 4px; border-radius: 4px; }',
'.kafa { width: 34px; height: 34px; border-radius: 50%; border: 2px solid white; object-fit: cover; z-index: 3; background: #222; }',
'.govde { width: 26px; height: 30px; border-radius: 8px 8px 3px 3px; margin-top: -3px; position: relative; box-shadow: inset -3px -3px 6px rgba(0,0,0,0.5); z-index: 2; border-top: 3px solid #fde047; }',
'.kol-sol, .kol-sag { position: absolute; top: 4px; width: 16px; height: 5px; border-radius: 3px; background: inherit; }',
'.kol-sol { left: -13px; transform: rotate(-20deg); }',
'.kol-sag { right: -13px; transform: rotate(20deg); }',
'.bacaklar { display: flex; gap: 4px; margin-top: -1px; }',
'.bacak { width: 7px; height: 14px; background: #111; border-radius: 0 0 3px 3px; }',
'.halay-basi .kafa { width: 44px; height: 44px; border: 3px solid #fbbf24; box-shadow: 0 0 15px #fbbf24; }',
'.mendil { position: absolute; right: -26px; top: -12px; font-size: 22px; animation: mendilSalla 0.3s infinite alternate; }',
'@keyframes mendilSalla { from { transform: rotate(-20deg); } to { transform: rotate(25deg); } }',
'.havai-fisek { position: absolute; font-size: 42px; animation: patla 1.2s ease-out forwards; pointer-events: none; z-index: 400; }',
'@keyframes patla { 0% { transform: scale(0.2); opacity: 1; } 100% { transform: scale(2.2); opacity: 0; } }',
'',
'',
'',
'',
'',
'',
'  2️⃣ Hediye at, düğün şenlensin 🌹',
'  Plakanı yaz halaya katıl, şehrini zirveye taşı!',
'',
'',
'  ✨ 81 İL MEMLEKET DÜĞÜNÜ',
'  ⏳ TUR 1 • CANLI',
'',
'',
'🔥 Plakanı yaz (Örn: 34, 48, 01) halaya katıl!',
'',
'  ❤️ 600/3.000 → 🥁 DAVUL ŞOVU',
'  💎 150/500 → 🎆 HAVAİ FİŞEK',
'',
'',
'',
'  ',
'    ',
'      ',
'        ',
'        ',
'        ',
'        ',
'        ',
'        ',
'        ',
'        ',
'        ',
'        ',
'        ',
'        ',
'      ',
'    ',
'    🥁 OSİMHEN & DAVUL EKİBİ',
'  ',
'',
'',
'',
'const socket = io();',
'const meydan = document.getElementById("meydan");',
'const sehirDiv = document.getElementById("sehir-skorlar");',
'const farkDiv = document.getElementById("fark-bilgi");',
'const bildirimDiv = document.getElementById("bildirim-alani");',
'const renkler = ["#dc2626", "#2563eb", "#16a34a", "#9333ea", "#ea580c", "#e11d48"];',
'let oyuncular = [];',
'let donusAcisi = 0;',
'let davulPuan = 600;',
'let fisekPuan = 150;',
'let skorlar = {',
'  "34": { plaka: "34", ad: "İstanbul", puan: 150 },',
'  "48": { plaka: "48", ad: "Muğla", puan: 120 },',
'  "06": { plaka: "06", ad: "Ankara", puan: 90 }',
'};',
'function tabloGuncelle() {',
'  const sirali = Object.values(skorlar).sort((a, b) => b.puan - a.puan).slice(0, 3);',
'  sehirDiv.innerHTML = sirali.map(s => "<div class=\"sehir-kart\"><span class=\"plaka\">" + s.plaka + "" + s.ad + "<div class=\"sehir-puan\">" + s.puan.toLocaleString("tr-TR") + "").join("");',
'  if (sirali.length >= 2) {',
'    const fark = sirali.puan - sirali.puan + 1;',
'    farkDiv.innerText = "🔥 " + sirali.ad + ", 1. olmaya " + fark.toLocaleString("tr-TR") + " puan uzakta!";',
'  }',
'}',
'tabloGuncelle();',
'function havaiFisekPatlat() {',
'  for (let i = 0; i < 6; i++) {',
'    setTimeout(() => {',
'      const f = document.createElement("div");',
'      f.className = "havai-fisek";',
'      f.innerText = ["🎆", "🎇", "✨"][Math.floor(Math.random() * 3)];',
'      f.style.left = (15 + Math.random() * 70) + "vw";',
'      f.style.top = (15 + Math.random() * 40) + "vh";',
'      document.body.appendChild(f);',
'      setTimeout(() => f.remove(), 1200);',
'    }, i * 250);',
'  }',
'}',
'function bildirimGoster(tip, isim, resim, altYazi) {',
'  const kart = document.createElement("div");',
'  kart.className = tip === "katilim" ? "bildirim-kart katilim" : "bildirim-kart";',
'  const baslik = tip === "katilim" ? "✅ HALAYA KATILDI • " + isim : "🎁 " + isim + " → " + altYazi;',
'  kart.innerHTML = "<img src=\"" + resim + "\"><div class=\"kart-detay\"><div class=\"kart-ust\">" + baslik + "<div class=\"kart-alt\">81 İl Memleket Düğünü";',
'  bildirimDiv.prepend(kart);',
'  if (bildirimDiv.children.length > 2) bildirimDiv.lastChild.remove();',
'  setTimeout(() => { if (kart) kart.remove(); }, 4500);',
'}',
'function halkayiGuncelle() {',
'  donusAcisi += 0.006;',
'  const merkezX = meydan.offsetWidth / 2;',
'  const merkezY = meydan.offsetHeight / 2;',
'  const yaricapX = merkezX * 0.84;',
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
'function oyuncuEkle(data, basiMi) {',
'  const sehir = data.sehir || { plaka: "34", ad: "İstanbul" };',
'  if (!skorlar[sehir.plaka]) skorlar[sehir.plaka] = { plaka: sehir.plaka, ad: sehir.ad, puan: 0 };',
'  skorlar[sehir.plaka].puan += basiMi ? (data.jeton || 25) : 5;',
'  tabloGuncelle();',
'  let mevcut = oyuncular.find(o => o.isim === data.isim);',
'  const kiyafetRengi = basiMi ? "#f59e0b" : renkler[Math.floor(Math.random() * renkler.length)];',
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
'  if (oyuncular.length > 26) {',
'    const cikan = oyuncular.pop();',
'    const cikanEl = document.getElementById("oyuncu-" + cikan.isim);',
'    if (cikanEl) cikanEl.remove();',
'  }',
'  const div = document.createElement("div");',
'  div.id = "oyuncu-" + data.isim;',
'  div.className = basiMi ? "karakter halay-basi" : "karakter";',
'  const mendil = basiMi ? "<span class=\"mendil\">🧣" : "";',
'  div.innerHTML = "<div class=\"etiket\"><span class=\"etiket-plaka\">" + sehir.plaka + "" + data.isim + "" +',
'                  "<img class=\"kafa\" src=\"" + data.resim + "\">" +',
'                  "<div class=\"govde\" style=\"background:" + kiyafetRengi + "\"><div class=\"kol-sol\"><div class=\"kol-sag\">" + mendil + "" +',
'                  "<div class=\"bacaklar\"><div class=\"bacak\"><div class=\"bacak\">";',
'  meydan.appendChild(div);',
'  if (basiMi) {',
'    bildirimGoster("hediye", data.isim, data.resim, (data.hediyeAdi || "Rose") + " x" + (data.adet || 1) + " (+" + (data.jeton || 25) + " " + sehir.plaka + " " + sehir.ad + ")");',
'    fisekPuan += (data.jeton || 25);',
'    if (fisekPuan >= 500) { fisekPuan = 0; havaiFisekPatlat(); }',
'    document.getElementById("fisek-sayi").innerText = fisekPuan;',
'    document.getElementById("fisek-bar").style.width = Math.min(100, (fisekPuan / 500) * 100) + "%";',
'  } else {',
'    bildirimGoster("katilim", data.isim, data.resim, sehir.plaka + " " + sehir.ad);',
'  }',
'}',
'socket.on("halayaKatil", d => oyuncuEkle(d, false));',
'socket.on("halayBasiYap", d => oyuncuEkle(d, true));',
'socket.on("begeniGeldi", s => {',
'  davulPuan += s;',
'  if (davulPuan >= 3000) { davulPuan = 0; havaiFisekPatlat(); }',
'  document.getElementById("davul-sayi").innerText = davulPuan;',
'  document.getElementById("davul-bar").style.width = Math.min(100, (davulPuan / 3000) * 100) + "%";',
'});',
'',
'',
''
].join('\n');
res.send(html);
});
server.listen(process.env.PORT || 3000);
