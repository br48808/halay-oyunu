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

const sehirler = {
    "01": "Adana", "02": "Adıyaman", "03": "Afyon", "04": "Ağrı", "05": "Amasya",
    "06": "Ankara", "07": "Antalya", "08": "Artvin", "09": "Aydın", "10": "Balıkesir",
    "11": "Bilecik", "12": "Bingöl", "13": "Bitlis", "14": "Bolu", "15": "Burdur",
    "16": "Bursa", "17": "Çanakkale", "18": "Çankırı", "19": "Çorum", "20": "Denizli",
    "21": "Diyarbakır", "22": "Edirne", "23": "Elazığ", "24": "Erzincan", "25": "Erzurum",
    "26": "Eskişehir", "27": "Gaziantep", "28": "Giresun", "29": "Gümüşhane", "30": "Hakkari",
    "31": "Hatay", "32": "Isparta", "33": "Mersin", "34": "İstanbul", "35": "İzmir",
    "36": "Kars", "37": "Kastamonu", "38": "Kayseri", "39": "Kırklareli", "40": "Kırşehir",
    "41": "Kocaeli", "42": "Konya", "43": "Kütahya", "44": "Malatya", "45": "Manisa",
    "46": "K.Maraş", "47": "Mardin", "48": "Muğla", "49": "Muş", "50": "Nevşehir",
    "51": "Niğde", "52": "Ordu", "53": "Rize", "54": "Sakarya", "55": "Samsun",
    "56": "Siirt", "57": "Sinop", "58": "Sivas", "59": "Tekirdağ", "60": "Tokat",
    "61": "Trabzon", "62": "Tunceli", "63": "Şanlıurfa", "64": "Uşak", "65": "Van",
    "66": "Yozgat", "67": "Zonguldak", "68": "Aksaray", "69": "Bayburt", "70": "Karaman",
    "71": "Kırıkkale", "72": "Batman", "73": "Şırnak", "74": "Bartın", "75": "Ardahan",
    "76": "Iğdır", "77": "Yalova", "78": "Karabük", "79": "Kilis", "80": "Osmaniye",
    "81": "Düzce"
};

function sehirBul(metin) {
    const kucuk = metin.toLowerCase();
    const plakalar = Object.keys(sehirler);
    for (let p of plakalar) {
        if (kucuk.includes(p) || kucuk.includes(sehirler[p].toLowerCase())) {
            return { plaka: p, ad: sehirler[p] };
        }
    }
    const rastgelePlaka = plakalar[Math.floor(Math.random() * plakalar.length)];
    return { plaka: rastgelePlaka, ad: sehirler[rastgelePlaka] };
}

tiktok.on('chat', data => {
    const mesaj = data.comment;
    const sehir = sehirBul(mesaj);
    io.emit('yorumGeldi', { isim: data.uniqueId, resim: data.profilePictureUrl, mesaj: mesaj, sehir: sehir });
    if (mesaj.toLowerCase().includes('halay') || mesaj.toLowerCase().includes('katıl') || Object.keys(sehirler).some(p => mesaj.includes(p))) {
        io.emit('halayaKatil', { isim: data.uniqueId, resim: data.profilePictureUrl, sehir: sehir });
    }
});

tiktok.on('gift', data => {
    if (data.giftType === 1 && !data.repeatEnd) return;
    const jeton = (data.diamondCount || 1) * (data.repeatCount || 1);
    const sehir = sehirBul("");
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

app.get('/test-katil', (req, res) => {
    const no = Math.floor(Math.random() * 90) + 10;
    const sehir = sehirBul("");
    io.emit('halayaKatil', {
        isim: 'Elif' + no,
        resim: 'https://dicebear.com' + no,
        sehir: sehir
    });
    res.send('Oyuncu (' + sehir.plaka + ' ' + sehir.ad + ') halaya katıldı!');
});

app.get('/test-hediye', (req, res) => {
    const no = Math.floor(Math.random() * 90) + 10;
    const sehir = sehirBul("");
    io.emit('halayBasiYap', {
        isim: 'Derya' + no,
        resim: 'https://dicebear.com' + no,
        jeton: 25,
        hediyeAdi: 'Rose',
        adet: 5,
        sehir: sehir
    });
    res.send('Hediye (' + sehir.plaka + ' ' + sehir.ad + ' +25 puan) gönderildi!');
});

app.get('/', (req, res) => {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.write('<!DOCTYPE html><html lang="tr"><head><meta charset="UTF-8"><style>');
    res.write('* { box-sizing: border-box; margin: 0; padding: 0; font-family: Arial, sans-serif; }');
    res.write('body { width: 100vw; height: 100vh; overflow: hidden; background: radial-gradient(circle at 50% 45%, #4a2c18 0%, #1c110a 60%, #090503 100%); position: relative; color: white; }');
    res.write('.ust-banner { position: absolute; top: 18px; left: 50%; transform: translateX(-50%); width: 92vw; background: #14100d; border: 2px solid #eab308; border-radius: 14px; padding: 10px; text-align: center; box-shadow: 0 6px 20px rgba(0,0,0,0.8); z-index: 300; }');
    res.write('.ust-banner h1 { font-size: 18px; font-weight: 900; color: #fde047; }');
    res.write('.ust-banner p { font-size: 13px; font-weight: bold; color: #fff; margin-top: 3px; }');
    res.write('.lig-baslik { position: absolute; top: 84px; left: 50%; transform: translateX(-50%); width: 94vw; display: flex; justify-content: space-between; font-size: 12px; font-weight: 900; color: #fbbf24; z-index: 290; }');
    res.write('#sehir-skorlar { position: absolute; top: 108px; left: 50%; transform: translateX(-50%); width: 95vw; display: flex; gap: 6px; z-index: 290; }');
    res.write('.sehir-kart { flex: 1; background: rgba(20, 15, 10, 0.95); border: 1.5px solid #f59e0b; border-radius: 8px; padding: 6px 8px; display: flex; justify-content: space-between; align-items: center; font-size: 12px; font-weight: 800; }');
    res.write('.plaka { background: #2563eb; color: white; padding: 1px 5px; border-radius: 4px; font-size: 10px; margin-right: 4px; }');
    res.write('.sehir-puan { color: #fde047; font-weight: 900; }');
    res.write('.fark-bilgi { position: absolute; top: 145px; left: 50%; transform: translateX(-50%); width: 94vw; background: rgba(0,0,0,0.85); border-radius: 6px; padding: 5px; text-align: center; font-size: 11px; font-weight: 800; color: #fef08a; border: 1px solid #d97706; z-index: 290; }');
    res.write('.barlar { position: absolute; top: 175px; left: 50%; transform: translateX(-50%); width: 94vw; display: flex; gap: 8px; z-index: 290; }');
    res.write('.bar-kutu { flex: 1; background: rgba(0,0,0,0.85); border-radius: 10px; padding: 5px 8px; border: 1px solid #555; font-size: 10px; font-weight: 800; }');
    res.write('.bar-doluluk { height: 6px; border-radius: 4px; margin-top: 4px; transition: width 0.3s; }');
    res.write('#bildirim-alani { position: absolute; top: 215px; left: 50%; transform: translateX(-50%); width: 88vw; display: flex; flex-direction: column; gap: 6px; z-index: 280; pointer-events: none; }');
    res.write('.bildirim-kart { background: rgba(45, 25, 10, 0.95); border: 2px solid #fbbf24; border-radius: 12px; padding: 6px 10px; display: flex; align-items: center; gap: 10px; }');
    res.write('.bildirim-kart.katilim { border-color: #22c55e; background: rgba(15, 45, 25, 0.95); }');
    res.write('.bildirim-kart img { width: 38px; height: 38px; border-radius: 50%; border: 2px solid gold; }');
    res.write('#meydan { position: absolute; top: 65%; left: 50%; transform: translate(-50%, -50%); width: 95vw; height: 50vh; border-radius: 50%; background: radial-gradient(circle, #8a6240 0%, #4a301d 60%, #1c110a 100%); border: 5px solid #f59e0b; box-shadow: 0 0 50px rgba(245, 158, 11, 0.4); }');
    res.write('#sahne-platform { position: absolute; top: 48%; left: 50%; transform: translate(-50%, -50%); width: 190px; height: 125px; background: linear-gradient(180deg, #b45309, #451a03); border-radius: 18px; border: 3px solid #fde047; display: flex; flex-direction: column; align-items: center; justify-content: flex-end; padding-bottom: 6px; z-index: 60; }');
    res.write('#osimhen-kutu { position: absolute; bottom: 20px; animation: ritim 0.45s infinite alternate; }');
    res.write('@keyframes ritim { from { transform: translateY(0); } to { transform: translateY(-8px); } }');
    res.write('.sahne-tabela { background: #111; color: #fde047; font-size: 9px; font-weight: 900; padding: 2px 8px; border-radius: 6px; border: 1px solid #f59e0b; }');
    res.write('.karakter { position: absolute; display: flex; flex-direction: column; align-items: center; transform: translate(-50%, -88%); animation: adim 0.45s infinite alternate; }');
    res.write('@keyframes adim { from { transform: translate(-50%, -88%) translateY(0); } to { transform: translate(-50%, -88%) translateY(-8px); } }');
    res.write('.etiket { background: rgba(0,0,0,0.9); color: white; font-size: 10px; font-weight: 800; padding: 2px 6px; border-radius: 10px; margin-bottom: 2px; white-space: nowrap; }');
    res.write('.etiket-plaka { background: #dc2626; color: #fef08a; font-size: 9px; padding: 0 4px; border-radius: 4px; margin-right: 3px; }');
    res.write('.insan-kafa { width: 34px; height: 34px; border-radius: 50%; border: 2px solid #fde68a; object-fit: cover; z-index: 4; background: #222; }');
    res.write('.halay-basi .insan-kafa { width: 42px; height: 42px; border: 3px solid #fbbf24; }');
    res.write('.govde { width: 28px; height: 34px; border-radius: 8px 8px 3px 3px; margin-top: -4px; position: relative; border-top: 3px solid #fde047; }');
    res.write('.kol-sol, .kol-sag { position: absolute; top: 5px; width: 16px; height: 5px; background: #f8fafc; border-radius: 3px; }');
    res.write('.kol-sol { left: -13px; transform: rotate(-20deg); }');
    res.write('.kol-sag { right: -13px; transform: rotate(20deg); }');
    res.write('.bacaklar { display: flex; gap: 4px; margin-top: -1px; }');
    res.write('.bacak { width: 7px; height: 15px; background: #0f172a; border-radius: 0 0 3px 3px; }');
    res.write('.mendil { position: absolute; right: -26px; top: -14px; font-size: 22px; }');
    res.write('.havai-fisek { position: absolute; font-size: 42px; animation: patla 1.2s forwards; z-index: 400; }');
res.write('@keyframes patla { from { transform: scale(0.2); opacity: 1; } to { transform: scale(2); opacity: 0; } }');
res.write('');
res.write('2️⃣ Hediye at, düğün şenlensin 🌹Plakanı yaz halaya katıl, şehrini zirveye taşı!');
res.write('✨ 81 İL MEMLEKET DÜĞÜNÜ⏳ TUR 1 • CANLI');
res.write('');
res.write('🔥 Plakanı yaz (Örn: 34, 48, 01) halaya katıl!');
res.write('❤️ 600/3.000 → 🥁 DAVUL ŞOVU💎 150/500 → 🎆 HAVAİ FİŞEK');
res.write('');
res.write('');
res.write('');
res.write('🥁 OSİMHEN & DAVUL EKİBİ');
res.write('');
res.write('const socket = io();');
res.write('const meydan = document.getElementById("meydan");');
res.write('const sehirDiv = document.getElementById("sehir-skorlar");');
res.write('const farkDiv = document.getElementById("fark-bilgi");');
res.write('const bildirimDiv = document.getElementById("bildirim-alani");');
res.write('const renkler = ["#991b1b", "#1e40af", "#166534", "#6b21a8", "#9a3412", "#831843"];');
res.write('let oyuncular = []; let donusAcisi = 0; let davulPuan = 600; let fisekPuan = 150;');
res.write('let skorlar = { "34": { plaka: "34", ad: "İstanbul", puan: 150 }, "48": { plaka: "48", ad: "Muğla", puan: 120 }, "06": { plaka: "06", ad: "Ankara", puan: 90 } };');
res.write('function tabloGuncelle() {');
res.write('  const sirali = Object.values(skorlar).sort((a, b) => b.puan - a.puan).slice(0, 3);');
res.write('  sehirDiv.innerHTML = sirali.map(s => "<div class=\"sehir-kart\"><span class=\"plaka\">" + s.plaka + "" + s.ad + "<div class=\"sehir-puan\">" + s.puan + "").join("");');
res.write('  const birinci = sirali.at(0); const ikinci = sirali.at(1);');
res.write('  if (birinci && ikinci) { const fark = (birinci.puan - ikinci.puan) + 1; farkDiv.innerText = "🔥 " + ikinci.ad + ", 1. olmaya " + fark + " puan uzakta!"; }');
res.write('}');
res.write('tabloGuncelle();');
res.write('function havaiFisekPatlat() { for (let i = 0; i < 6; i++) { setTimeout(() => { const f = document.createElement("div"); f.className = "havai-fisek"; f.innerText = "🎆"; f.style.left = (15 + Math.random() * 70) + "vw"; f.style.top = (15 + Math.random() * 40) + "vh"; document.body.appendChild(f); setTimeout(() => f.remove(), 1200); }, i * 250); } }');
res.write('function bildirimGoster(tip, isim, resim, altYazi) { const kart = document.createElement("div"); kart.className = tip === "katilim" ? "bildirim-kart katilim" : "bildirim-kart"; const baslik = tip === "katilim" ? "✅ HALAYA KATILDI • " + isim : "🎁 " + isim + " → " + altYazi; kart.innerHTML = "<img src=\"" + resim + "\"><div style=\"font-weight:900;color:#fde047;font-size:12px;\">" + baslik + "<div style=\"font-size:10px;color:#eee;\">81 İl Memleket Düğünü"; bildirimDiv.prepend(kart); if (bildirimDiv.children.length > 2) bildirimDiv.lastChild.remove(); setTimeout(() => { if (kart) kart.remove(); }, 4500); }');
res.write('function halkayiGuncelle() { donusAcisi += 0.006; const merkezX = meydan.offsetWidth / 2; const merkezY = meydan.offsetHeight / 2; const yaricapX = merkezX * 0.84; const yaricapY = merkezY * 0.78; oyuncular.forEach((oyuncu, index) => { const el = document.getElementById("oyuncu-" + oyuncu.isim); if (!el) return; const aci = donusAcisi + (index * (2 * Math.PI / oyuncular.length)); const x = merkezX + yaricapX * Math.cos(aci); const y = merkezY + yaricapY * Math.sin(aci); el.style.left = x + "px"; el.style.top = y + "px"; el.style.zIndex = Math.floor(y); }); requestAnimationFrame(halkayiGuncelle); }');
res.write('requestAnimationFrame(halkayiGuncelle);');
res.write('function oyuncuEkle(data, basiMi) {');
res.write('  const sehir = data.sehir || { plaka: "34", ad: "İstanbul" };');
res.write('  if (!skorlar[sehir.plaka]) skorlar[sehir.plaka] = { plaka: sehir.plaka, ad: sehir.ad, puan: 0 };');
res.write('  skorlar[sehir.plaka].puan += basiMi ? (data.jeton || 25) : 5; tabloGuncelle();');
res.write('  let mevcut = oyuncular.find(o => o.isim === data.isim);');
res.write('  const renk = basiMi ? "#d97706" : renkler[Math.floor(Math.random() * renkler.length)];');
res.write('  if (mevcut) { if (basiMi) { oyuncular = oyuncular.filter(o => o.isim !== data.isim); oyuncular.unshift({ isim: data.isim, resim: data.resim, basiMi: true }); const eskiEl = document.getElementById("oyuncu-" + data.isim); if (eskiEl) eskiEl.remove(); } else { return; } } else { if (basiMi) { oyuncular.unshift({ isim: data.isim, resim: data.resim, basiMi: true }); } else { oyuncular.push({ isim: data.isim, resim: data.resim, basiMi: false }); } }');
res.write('  if (oyuncular.length > 26) { const cikan = oyuncular.pop(); const cikanEl = document.getElementById("oyuncu-" + cikan.isim); if (cikanEl) cikanEl.remove(); }');
res.write('  const div = document.createElement("div"); div.id = "oyuncu-" + data.isim; div.className = basiMi ? "karakter halay-basi" : "karakter";');
res.write('  const mendil = basiMi ? "<span class=\"mendil\">🧣" : "";');
res.write('  div.innerHTML = "<div class=\"etiket\"><span class=\"etiket-plaka\">" + sehir.plaka + "" + data.isim + "<img class=\"insan-kafa\" src=\"" + data.resim + "\"><div class=\"govde\" style=\"background:" + renk + "\"><div class=\"kol-sol\"><div class=\"kol-sag\">" + mendil + "<div class=\"bacaklar\"><div class=\"bacak\"><div class=\"bacak\">";');
res.write('  meydan.appendChild(div);');
res.write('  if (basiMi) { bildirimGoster("hediye", data.isim, data.resim, (data.hediyeAdi || "Rose") + " x" + (data.adet || 1) + " (+" + (data.jeton || 25) + " " + sehir.plaka + " " + sehir.ad + ")"); fisekPuan += (data.jeton || 25); if (fisekPuan >= 500) { fisekPuan = 0; havaiFisekPatlat(); } document.getElementById("fisek-sayi").innerText = fisekPuan; document.getElementById("fisek-bar").style.width = Math.min(100, (fisekPuan / 500) * 100) + "%"; } else { bildirimGoster("katilim", data.isim, data.resim, sehir.plaka + " " + sehir.ad); }');
res.write('}');
res.write('socket.on("halayaKatil", d => oyuncuEkle(d, false)); socket.on("halayBasiYap", d => oyuncuEkle(d, true));');
res.write('socket.on("begeniGeldi", s => { davulPuan += s; if (davulPuan >= 3000) { davulPuan = 0; havaiFisekPatlat(); } document.getElementById("davul-sayi").innerText = davulPuan; document.getElementById("davul-bar").style.width = Math.min(100, (davulPuan / 3000) * 100) + "%"; });');
res.write('');
res.end();
});
server.listen(process.env.PORT || 3000);
