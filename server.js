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
    { plaka: "01", ad: "Adana" }, { plaka: "02", ad: "Adıyaman" }, { plaka: "03", ad: "Afyon" },
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
    { plaka: "46", ad: "K.Maraş" }, { plaka: "47", ad: "Mardin" }, { plaka: "48", ad: "Muğla" },
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
    for (let i = 0; i < sehirListesi.length; i++) {
        const s = sehirListesi[i];
        if (kucuk.includes(s.ad.toLowerCase()) || kucuk.includes(s.plaka)) return s;
    }
    return sehirListesi[Math.floor(Math.random() * sehirListesi.length)];
}

tiktok.on('chat', data => {
    const mesaj = data.comment;
    const sehir = sehirBul(mesaj);
    io.emit('yorumGeldi', { isim: data.uniqueId, resim: data.profilePictureUrl, mesaj: mesaj, sehir: sehir });
    if (mesaj.toLowerCase().includes('halay') || mesaj.toLowerCase().includes('katıl') || sehirListesi.some(s => mesaj.includes(s.plaka))) {
        io.emit('halayaKatil', { isim: data.uniqueId, resim: data.profilePictureUrl, sehir: sehir });
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

app.get('/test-katil', (req, res) => {
    const no = Math.floor(Math.random() * 90) + 10;
    const isim = 'Elif' + no;
    const sehir = sehirListesi[Math.floor(Math.random() * sehirListesi.length)];
    const avatarUrl = 'https://dicebear.com' + no;
    io.emit('halayaKatil', { isim: isim, resim: avatarUrl, sehir: sehir });
    res.send('Oyuncu (' + sehir.plaka + ' ' + sehir.ad + ') halaya katıldı!');
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
    res.send('Hediye (' + sehir.plaka + ' ' + sehir.ad + ' +25 puan) gönderildi!');
});

app.get('/', (req, res) => {
    res.type('html');
    res.send(`<!DOCTYPE html>
<html lang="tr">
<head>
<meta charset="UTF-8">
<style>
* { box-sizing: border-box; margin: 0; padding: 0; font-family: Arial, sans-serif; }
body { width: 100vw; height: 100vh; overflow: hidden; background: radial-gradient(circle at 50% 45%, #4a2c18 0%, #1c110a 60%, #090503 100%); position: relative; color: white; }
.ust-banner { position: absolute; top: 16px; left: 50%; transform: translateX(-50%); width: 92vw; background: #14100d; border: 2px solid #eab308; border-radius: 14px; padding: 10px; text-align: center; box-shadow: 0 6px 20px rgba(0,0,0,0.8); z-index: 300; }
.ust-banner h1 { font-size: 18px; font-weight: 900; color: #fde047; }
.ust-banner p { font-size: 13px; font-weight: bold; color: #fff; margin-top: 3px; }
.lig-baslik { position: absolute; top: 82px; left: 50%; transform: translateX(-50%); width: 94vw; display: flex; justify-content: space-between; font-size: 12px; font-weight: 900; color: #fbbf24; z-index: 290; }
#sehir-skorlar { position: absolute; top: 105px; left: 50%; transform: translateX(-50%); width: 95vw; display: flex; gap: 6px; z-index: 290; }
.sehir-kart { flex: 1; background: rgba(20, 15, 10, 0.95); border: 1.5px solid #f59e0b; border-radius: 8px; padding: 5px 7px; display: flex; justify-content: space-between; align-items: center; font-size: 12px; font-weight: 800; }
.plaka { background: #2563eb; color: white; padding: 1px 4px; border-radius: 4px; font-size: 10px; margin-right: 4px; }
.sehir-puan { color: #fde047; font-weight: 900; }
.fark-bilgi { position: absolute; top: 140px; left: 50%; transform: translateX(-50%); width: 94vw; background: rgba(0,0,0,0.8); border-radius: 6px; padding: 4px; text-align: center; font-size: 11px; font-weight: 800; color: #fef08a; border: 1px solid #d97706; z-index: 290; }
.barlar { position: absolute; top: 168px; left: 50%; transform: translateX(-50%); width: 94vw; display: flex; gap: 8px; z-index: 290; }
.bar-kutu { flex: 1; background: rgba(0,0,0,0.85); border-radius: 10px; padding: 4px 8px; border: 1px solid #555; font-size: 10px; font-weight: 800; }
.bar-doluluk { height: 6px; border-radius: 4px; margin-top: 3px; transition: width 0.3s; }
#bildirim-alani { position: absolute; top: 205px; left: 50%; transform: translateX(-50%); width: 88vw; display: flex; flex-direction: column; gap: 6px; z-index: 280; pointer-events: none; }
.bildirim-kart { background: rgba(45, 25, 10, 0.95); border: 2px solid #fbbf24; border-radius: 12px; padding: 6px 10px; display: flex; align-items: center; gap: 10px; }
.bildirim-kart.katilim { border-color: #22c55e; background: rgba(15, 45, 25, 0.95); }
.bildirim-kart img { width: 38px; height: 38px; border-radius: 50%; border: 2px solid gold; }
#meydan { position: absolute; top: 65%; left: 50%; transform: translate(-50%, -50%); width: 95vw; height: 50vh; border-radius: 50%; background: radial-gradient(circle, #8a6240 0%, #4a301d 60%, #1c110a 100%); border: 5px solid #f59e0b; box-shadow: 0 0 50px rgba(245, 158, 11, 0.4); }
#sahne-platform { position: absolute; top: 48%; left: 50%; transform: translate(-50%, -50%); width: 190px; height: 125px; background: linear-gradient(180deg, #b45309, #451a03); border-radius: 18px; border: 3px solid #fde047; display: flex; flex-direction: column; align-items: center; justify-content: flex-end; padding-bottom: 6px; z-index: 60; }
#osimhen-kutu { position: absolute; bottom: 20px; animation: ritim 0.45s infinite alternate; }
@keyframes ritim { from { transform: translateY(0); } to { transform: translateY(-8px); } }
.sahne-tabela { background: #111; color: #fde047; font-size: 9px; font-weight: 900; padding: 2px 8px; border-radius: 6px; border: 1px solid #f59e0b; }
.karakter { position: absolute; display: flex; flex-direction: column; align-items: center; transform: translate(-50%, -88%); animation: adim 0.45s infinite alternate; }
@keyframes adim { from { transform: translate(-50%, -88%) translateY(0); } to { transform: translate(-50%, -88%) translateY(-8px); } }
.etiket { background: rgba(0,0,0,0.9); color: white; font-size: 10px; font-weight: 800; padding: 2px 6px; border-radius: 10px; margin-bottom: 2px; white-space: nowrap; }
.etiket-plaka { background: #dc2626; color: #fef08a; font-size: 9px; padding: 0 4px; border-radius: 4px; margin-right: 3px; }
.insan-kafa { width: 34px; height: 34px; border-radius: 50%; border: 2px solid #fde68a; object-fit: cover; z-index: 4; background: #222; }
.halay-basi .insan-kafa { width: 42px; height: 42px; border: 3px solid #fbbf24; }
.govde { width: 28px; height: 34px; border-radius: 8px 8px 3px 3px; margin-top: -4px; position: relative; border-top: 3px solid #fde047; }
.kol-sol, .kol-sag { position: absolute; top: 5px; width: 16px; height: 5px; background: #f8fafc; border-radius: 3px; }
.kol-sol { left: -13px; transform: rotate(-20deg); }
.kol-sag { right: -13px; transform: rotate(20deg); }
.bacaklar { display: flex; gap: 4px; margin-top: -1px; }
.bacak { width: 7px; height: 15px; background: #0f172a; border-radius: 0 0 3px 3px; }
.mendil { position: absolute; right: -26px; top: -14px; font-size: 22px; }
.havai-fisek { position: absolute; font-size: 42px; animation: patla 1.2s forwards; z-index: 400; }
@keyframes patla { from { transform: scale(0.2); opacity: 1; } to { transform: scale(2); opacity: 0; } }




2️⃣ Hediye at, düğün şenlensin 🌹
Plakanı yaz halaya katıl, şehrini zirveye taşı!


✨ 81 İL MEMLEKET DÜĞÜNÜ
⏳ TUR 1 • CANLI


🔥 Plakanı yaz (Örn: 34, 48, 01) halaya katıl!

❤️ 600/3.000 → 🥁 DAVUL ŞOVU
💎 150/500 → 🎆 HAVAİ FİŞEK































🥁 OSİMHEN & DAVUL EKİBİ




const socket = io();
const meydan = document.getElementById("meydan");
const sehirDiv = document.getElementById("sehir-skorlar");
const farkDiv = document.getElementById("fark-bilgi");
const bildirimDiv = document.getElementById("bildirim-alani");
const renkler = ["#991b1b", "#1e40af", "#166534", "#6b21a8", "#9a3412", "#831843"];
let oyuncular = [];
let donusAcisi = 0;
let davulPuan = 600;
let fisekPuan = 150;
let skorlar = {
"34": { plaka: "34", ad: "İstanbul", puan: 150 },
"48": { plaka: "48", ad: "Muğla", puan: 120 },
"06": { plaka: "06", ad: "Ankara", puan: 90 }
};
function tabloGuncelle() {
const sirali = Object.values(skorlar).sort((a, b) => b.puan - a.puan).slice(0, 3);
sehirDiv.innerHTML = sirali.map(s => '' + s.plaka + '' + s.ad + '' + s.puan + '').join("");
if (sirali.length >= 2) {
const fark = (sirali[0].puan - sirali[1].puan) + 1;
farkDiv.innerText = "🔥 " + sirali[1].ad + ", 1. olmaya " + fark + " puan uzakta!";
}
}
tabloGuncelle();
function havaiFisekPatlat() {
for (let i = 0; i < 6; i++) {
setTimeout(() => {
const f = document.createElement("div");
f.className = "havai-fisek";
f.innerText = "🎆";
f.style.left = (15 + Math.random() * 70) + "vw";
f.style.top = (15 + Math.random() * 40) + "vh";
document.body.appendChild(f);
setTimeout(() => f.remove(), 1200);
}, i * 250);
}
}
function bildirimGoster(tip, isim, resim, altYazi) {
const kart = document.createElement("div");
kart.className = tip === "katilim" ? "bildirim-kart katilim" : "bildirim-kart";
const baslik = tip === "katilim" ? "✅ HALAYA KATILDI • " + isim : "🎁 " + isim + " → " + altYazi;
kart.innerHTML = '' + baslik + '81 İl Memleket Düğünü';
bildirimDiv.prepend(kart);
if (bildirimDiv.children.length > 2) bildirimDiv.lastChild.remove();
setTimeout(() => { if (kart) kart.remove(); }, 4500);
}
function halkayiGuncelle() {
donusAcisi += 0.006;
const merkezX = meydan.offsetWidth / 2;
const merkezY = meydan.offsetHeight / 2;
const yaricapX = merkezX * 0.84;
const yaricapY = merkezY * 0.78;
oyuncular.forEach((oyuncu, index) => {
const el = document.getElementById("oyuncu-" + oyuncu.isim);
if (!el) return;
const aci = donusAcisi + (index * (2 * Math.PI / oyuncular.length));
const x = merkezX + yaricapX * Math.cos(aci);
const y = merkezY + yaricapY * Math.sin(aci);
el.style.left = x + "px";
el.style.top = y + "px";
el.style.zIndex = Math.floor(y);
});
requestAnimationFrame(halkayiGuncelle);
}
requestAnimationFrame(halkayiGuncelle);
function oyuncuEkle(data, basiMi) {
const sehir = data.sehir || { plaka: "34", ad: "İstanbul" };
if (!skorlar[sehir.plaka]) skorlar[sehir.plaka] = { plaka: sehir.plaka, ad: sehir.ad, puan: 0 };
skorlar[sehir.plaka].puan += basiMi ? (data.jeton || 25) : 5;
tabloGuncelle();
let mevcut = oyuncular.find(o => o.isim === data.isim);
const renk = basiMi ? "#d97706" : renkler[Math.floor(Math.random() * renkler.length)];
if (mevcut) {
if (basiMi) {
oyuncular = oyuncular.filter(o => o.isim !== data.isim);
oyuncular.unshift({ isim: data.isim, resim: data.resim, basiMi: true });
const eskiEl = document.getElementById("oyuncu-" + data.isim);
if (eskiEl) eskiEl.remove();
} else { return; }
} else {
if (basiMi) { oyuncular.unshift({ isim: data.isim, resim: data.resim, basiMi: true }); }
else { oyuncular.push({ isim: data.isim, resim: data.resim, basiMi: false }); }
}
if (oyuncular.length > 26) {
const cikan = oyuncular.pop();
const cikanEl = document.getElementById("oyuncu-" + cikan.isim);
if (cikanEl) cikanEl.remove();
}
const div = document.createElement("div");
div.id = "oyuncu-" + data.isim;
div.className = basiMi ? "karakter halay-basi" : "karakter";
const mendil = basiMi ? '🧣' : '';
div.innerHTML = '' + sehir.plaka + '' + data.isim + '' +
'' +
'' + mendil + '' +
'';
meydan.appendChild(div);
if (basiMi) {
bildirimGoster("hediye", data.isim, data.resim, (data.hediyeAdi || "Rose") + " x" + (data.adet || 1) + " (+" + (data.jeton || 25) + " " + sehir.plaka + " " + sehir.ad + ")");
fisekPuan += (data.jeton || 25);
if (fisekPuan >= 500) { fisekPuan = 0; havaiFisekPatlat(); }
document.getElementById("fisek-sayi").innerText = fisekPuan;
document.getElementById("fisek-bar").style.width = Math.min(100, (fisekPuan / 500) * 100) + "%";
} else {
bildirimGoster("katilim", data.isim, data.resim, sehir.plaka + " " + sehir.ad);
}
}
socket.on("halayaKatil", d => oyuncuEkle(d, false));
socket.on("halayBasiYap", d => oyuncuEkle(d, true));
socket.on("begeniGeldi", s => {
davulPuan += s;
if (davulPuan >= 3000) { davulPuan = 0; havaiFisekPatlat(); }
document.getElementById("davul-sayi").innerText = davulPuan;
document.getElementById("davul-bar").style.width = Math.min(100, (davulPuan / 3000) * 100) + "%";
});


`);
});
server.listen(process.env.PORT || 3000);
