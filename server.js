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

app.get('/oyun.js', (req, res) => {
    res.type('application/javascript');
    res.send(`
const stil = document.createElement('style');
stil.textContent = \`
* { box-sizing: border-box; margin: 0; padding: 0; font-family: Arial, sans-serif; }
body { width: 100vw; height: 100vh; overflow: hidden; background: radial-gradient(circle at 50% 45%, #4a2c18 0%, #1c110a 60%, #090503 100%); position: relative; color: white; }
.ust-banner { position: absolute; top: 18px; left: 50%; transform: translateX(-50%); width: 92vw; background: #14100d; border: 2px solid #eab308; border-radius: 14px; padding: 10px; text-align: center; box-shadow: 0 6px 20px rgba(0,0,0,0.8); z-index: 300; }
.ust-banner h1 { font-size: 18px; font-weight: 900; color: #fde047; }
.ust-banner p { font-size: 13px; font-weight: bold; color: #fff; margin-top: 3px; }
.lig-baslik { position: absolute; top: 84px; left: 50%; transform: translateX(-50%); width: 94vw; display: flex; justify-content: space-between; font-size: 12px; font-weight: 900; color: #fbbf24; z-index: 290; }
#sehir-skorlar { position: absolute; top: 108px; left: 50%; transform: translateX(-50%); width: 95vw; display: flex; gap: 6px; z-index: 290; }
.sehir-kart { flex: 1; background: rgba(20, 15, 10, 0.95); border: 1.5px solid #f59e0b; border-radius: 8px; padding: 6px 8px; display: flex; justify-content: space-between; align-items: center; font-size: 12px; font-weight: 800; }
.plaka { background: #2563eb; color: white; padding: 1px 5px; border-radius: 4px; font-size: 10px; margin-right: 4px; }
.sehir-puan { color: #fde047; font-weight: 900; }
.fark-bilgi { position: absolute; top: 145px; left: 50%; transform: translateX(-50%); width: 94vw; background: rgba(0,0,0,0.85); border-radius: 6px; padding: 5px; text-align: center; font-size: 11px; font-weight: 800; color: #fef08a; border: 1px solid #d97706; z-index: 290; }
.barlar { position: absolute; top: 175px; left: 50%; transform: translateX(-50%); width: 94vw; display: flex; gap: 8px; z-index: 290; }
.bar-kutu { flex: 1; background: rgba(0,0,0,0.85); border-radius: 10px; padding: 5px 8px; border: 1px solid #555; font-size: 10px; font-weight: 800; }
.bar-doluluk { height: 6px; border-radius: 4px; margin-top: 4px; transition: width 0.3s; }
#bildirim-alani { position: absolute; top: 215px; left: 50%; transform: translateX(-50%); width: 88vw; display: flex; flex-direction: column; gap: 6px; z-index: 280; pointer-events: none; }
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
\`;
document.head.appendChild(stil);

document.body.innerHTML = \`
<div class="ust-banner">
  <h1>2️⃣ Hediye at, düğün şenlensin 🌹</h1>
  <p>Plakanı yaz halaya katıl, şehrini zirveye taşı!</p>
</div>
<div class="lig-baslik">
  <span>✨ 81 İL MEMLEKET DÜĞÜNÜ</span>
  <span>⏳ TUR 1 • CANLI</span>
</div>
<div id="sehir-skorlar"></div>
<div id="fark-bilgi" class="fark-bilgi">🔥 Plakanı yaz (Örn: 34, 48, 01) halaya katıl!</div>
<div class="barlar">
❤️ 600/3.000 → 🥁 DAVUL ŞOVU
💎 150/500 → 🎆 HAVAİ FİŞEK































🥁 OSİMHEN & DAVUL EKİBİ


`;
const socket = io();
const meydan = document.getElementById('meydan');
const sehirDiv = document.getElementById('sehir-skorlar');
const farkDiv = document.getElementById('fark-bilgi');
const bildirimDiv = document.getElementById('bildirim-alani');
const renkler = ['#991b1b', '#1e40af', '#166534', '#6b21a8', '#9a3412', '#831843'];
let oyuncular = [];
let donusAcisi = 0;
let davulPuan = 600;
let fisekPuan = 150;
let skorlar = {
'34': { plaka: '34', ad: 'İstanbul', puan: 150 },
'48': { plaka: '48', ad: 'Muğla', puan: 120 },
'06': { plaka: '06', ad: 'Ankara', puan: 90 }
};
function tabloGuncelle() {
const sirali = Object.values(skorlar).sort((a, b) => b.puan - a.puan).slice(0, 3);
sehirDiv.innerHTML = '';
sirali.forEach(s => {
const kart = document.createElement('div');
kart.className = 'sehir-kart';
kart.innerHTML = '' + s.plaka + '' + s.ad + '' + s.puan + '';
sehirDiv.appendChild(kart);
});
if (sirali.length >= 2) {
const fark = (sirali.puan - sirali.puan) + 1;
farkDiv.innerText = '🔥 ' + sirali.ad + ', 1. olmaya ' + fark + ' puan uzakta!';
}
}
tabloGuncelle();
function havaiFisekPatlat() {
for (let i = 0; i < 6; i++) {
setTimeout(() => {
const f = document.createElement('div');
f.className = 'havai-fisek';
f.innerText = '🎆';
f.style.left = (15 + Math.random() * 70) + 'vw';
f.style.top = (15 + Math.random() * 40) + 'vh';
document.body.appendChild(f);
setTimeout(() => f.remove(), 1200);
}, i * 250);
}
}
function bildirimGoster(tip, isim, resim, altYazi) {
const kart = document.createElement('div');
kart.className = tip === 'katilim' ? 'bildirim-kart katilim' : 'bildirim-kart';
const img = document.createElement('img');
img.src = resim;
const bilgi = document.createElement('div');
const ust = document.createElement('div');
ust.style.cssText = 'font-weight:900;color:#fde047;font-size:12px;';
ust.innerText = tip === 'katilim' ? '✅ HALAYA KATILDI • ' + isim : '🎁 ' + isim + ' → ' + altYazi;
const alt = document.createElement('div');
alt.style.cssText = 'font-size:10px;color:#eee;';
alt.innerText = '81 İl Memleket Düğünü';
bilgi.appendChild(ust);
bilgi.appendChild(alt);
kart.appendChild(img);
kart.appendChild(bilgi);
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
const el = document.getElementById('oyuncu-' + oyuncu.isim);
if (!el) return;
const aci = donusAcisi + (index * (2 * Math.PI / oyuncular.length));
const x = merkezX + yaricapX * Math.cos(aci);
const y = merkezY + yaricapY * Math.sin(aci);
el.style.left = x + 'px';
el.style.top = y + 'px';
el.style.zIndex = Math.floor(y);
});
requestAnimationFrame(halkayiGuncelle);
}
requestAnimationFrame(halkayiGuncelle);
function oyuncuEkle(data, basiMi) {
const sehir = data.sehir || { plaka: '34', ad: 'İstanbul' };
if (!skorlar[sehir.plaka]) skorlar[sehir.plaka] = { plaka: sehir.plaka, ad: sehir.ad, puan: 0 };
skorlar[sehir.plaka].puan += basiMi ? (data.jeton || 25) : 5;
tabloGuncelle();
let mevcut = oyuncular.find(o => o.isim === data.isim);
const renk = basiMi ? '#d97706' : renkler[Math.floor(Math.random() * renkler.length)];
if (mevcut) {
if (basiMi) {
oyuncular = oyuncular.filter(o => o.isim !== data.isim);
oyuncular.unshift({ isim: data.isim, resim: data.resim, basiMi: true });
const eskiEl = document.getElementById('oyuncu-' + data.isim);
if (eskiEl) eskiEl.remove();
} else { return; }
} else {
if (basiMi) { oyuncular.unshift({ isim: data.isim, resim: data.resim, basiMi: true }); }
else { oyuncular.push({ isim: data.isim, resim: data.resim, basiMi: false }); }
}
if (oyuncular.length > 26) {
const cikan = oyuncular.pop();
const cikanEl = document.getElementById('oyuncu-' + cikan.isim);
if (cikanEl) cikanEl.remove();
}
const div = document.createElement('div');
div.id = 'oyuncu-' + data.isim;
div.className = basiMi ? 'karakter halay-basi' : 'karakter';
const etiket = document.createElement('div');
etiket.className = 'etiket';
const plakaSpan = document.createElement('span');
plakaSpan.className = 'etiket-plaka';
plakaSpan.innerText = sehir.plaka;
etiket.appendChild(plakaSpan);
etiket.appendChild(document.createTextNode(data.isim));
const kafa = document.createElement('img');
kafa.className = 'insan-kafa';
kafa.src = data.resim;
const govde = document.createElement('div');
govde.className = 'govde';
govde.style.background = renk;
const kolSol = document.createElement('div');
kolSol.className = 'kol-sol';
const kolSag = document.createElement('div');
kolSag.className = 'kol-sag';
govde.appendChild(kolSol);
govde.appendChild(kolSag);
if (basiMi) {
const mendil = document.createElement('span');
mendil.className = 'mendil';
mendil.innerText = '🧣';
govde.appendChild(mendil);
}
const bacaklar = document.createElement('div');
bacaklar.className = 'bacaklar';
const b1 = document.createElement('div');
b1.className = 'bacak';
const b2 = document.createElement('div');
b2.className = 'bacak';
bacaklar.appendChild(b1);
bacaklar.appendChild(b2);
div.appendChild(etiket);
div.appendChild(kafa);
div.appendChild(govde);
div.appendChild(bacaklar);
meydan.appendChild(div);
if (basiMi) {
bildirimGoster('hediye', data.isim, data.resim, (data.hediyeAdi || 'Rose') + ' x' + (data.adet || 1) + ' (+' + (data.jeton || 25) + ' ' + sehir.plaka + ' ' + sehir.ad + ')');
fisekPuan += (data.jeton || 25);
if (fisekPuan >= 500) { fisekPuan = 0; havaiFisekPatlat(); }
document.getElementById('fisek-sayi').innerText = fisekPuan;
document.getElementById('fisek-bar').style.width = Math.min(100, (fisekPuan / 500) * 100) + '%';
} else {
bildirimGoster('katilim', data.isim, data.resim, sehir.plaka + ' ' + sehir.ad);
}
}
socket.on('halayaKatil', d => oyuncuEkle(d, false));
socket.on('halayBasiYap', d => oyuncuEkle(d, true));
socket.on('begeniGeldi', s => {
davulPuan += s;
if (davulPuan >= 3000) { davulPuan = 0; havaiFisekPatlat(); }
document.getElementById('davul-sayi').innerText = davulPuan;
document.getElementById('davul-bar').style.width = Math.min(100, (davulPuan / 3000) * 100) + '%';
});
`);
});
app.get('/', (req, res) => {
const s = String.fromCharCode(60);
const e = String.fromCharCode(62);
res.send(
s + '!DOCTYPE html' + e +
s + 'html' + e +
s + 'head' + e + s + 'meta charset="UTF-8"' + e + s + '/head' + e +
s + 'body' + e +
s + 'script src="/socket.io/socket.io.js"' + e + s + '/script' + e +
s + 'script src="/oyun.js"' + e + s + '/script' + e +
s + '/body' + e +
s + '/html' + e
);
});
server.listen(process.env.PORT || 3000);
