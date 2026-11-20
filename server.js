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

// Yorumları dinle (Hem halaya alır hem konuşma balonu çıkarır)
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

// Hediyeleri dinle (Halay başı yapar ve ekranda duyuru patlatır)
tiktok.on('gift', data => {
    if (data.giftType === 1 && !data.repeatEnd) return;
    io.emit('halayBasiYap', {
        isim: data.uniqueId,
        resim: data.profilePictureUrl
    });
});

// Beğenileri dinle
tiktok.on('like', data => {
    io.emit('begeniGeldi', data.likeCount || 1);
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
    res.send('Test oyuncusu halkaya eklendi!');
});

app.get('/test-hediye', (req, res) => {
    const no = Math.floor(Math.random() * 100);
    io.emit('halayBasiYap', {
        isim: 'Kral_' + no,
        resim: 'https://dicebear.com' + no
    });
    res.send('Test Halay Basi eklendi!');
});

app.get('/', (req, res) => {
    res.send(`
    <!DOCTYPE html>
    <html lang="tr">
    <head>
        <meta charset="UTF-8">
        <style>
            * { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; }
            body {
                width: 100vw;
                height: 100vh;
                overflow: hidden;
                /* Köy düğünü akşamı atmosferi */
                background: radial-gradient(circle at 50% 60%, #7c3f1d 0%, #3d1c0a 55%, #1a0b04 100%);
                position: relative;
                color: white;
            }
            /* Üst Bilgi ve Kural Alanı */
            .ust-bilgi {
                position: absolute;
                top: 25px;
                left: 20px;
                background: rgba(0, 0, 0, 0.6);
                padding: 8px 15px;
                border-radius: 20px;
                font-size: 16px;
                font-weight: bold;
                border: 2px solid #f59e0b;
                z-index: 100;
            }
            /* Ortadaki Büyük Dev Banner */
            .dev-banner {
                position: absolute;
                top: 32%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: rgba(255, 255, 255, 0.95);
                color: #111;
                padding: 14px 28px;
                border-radius: 14px;
                font-size: 28px;
                font-weight: 900;
                letter-spacing: 1px;
                box-shadow: 0 10px 30px rgba(0,0,0,0.7);
                border: 4px solid #dc2626;
                white-space: nowrap;
                z-index: 90;
                text-align: center;
            }
            .alt-kural {
                font-size: 14px;
                font-weight: 700;
                color: #b91c1c;
                margin-top: 4px;
            }
            /* Düğün Meydanı Zemini (Halay Halkası Alanı) */
            #meydan {
                position: absolute;
                bottom: 80px;
                left: 50%;
                transform: translateX(-50%);
                width: 90vw;
                height: 52vh;
                border-radius: 50%;
                background: radial-gradient(circle, rgba(251, 191, 36, 0.25) 0%, rgba(180, 83, 9, 0.4) 70%, rgba(120, 53, 15, 0.8) 100%);
                border: 6px dashed rgba(251, 191, 36, 0.6);
                box-shadow: 0 0 60px rgba(245, 158, 11, 0.4), inset 0 0 40px rgba(0,0,0,0.6);
            }
            /* Halay Çeken Karakter Tasarımı */
            .karakter {
                position: absolute;
                display: flex;
                flex-direction: column;
                align-items: center;
                transform: translate(-50%, -50%);
                transition: left 0.2s linear, top 0.2s linear;
                animation: halayRitmi 0.45s infinite alternate ease-in-out;
            }
            @keyframes halayRitmi {
                0% { transform: translate(-50%, -50%) translateY(0px) rotate(-4deg); }
                100% { transform: translate(-50%, -50%) translateY(-14px) rotate(4deg); }
            }
            /* Konuşma Balonu */
            .balon {
                background: white;
                color: #111;
                padding: 5px 10px;
                border-radius: 12px;
                font-size: 13px;
                font-weight: bold;
                max-width: 140px;
                text-align: center;
                box-shadow: 0 4px 10px rgba(0,0,0,0.5);
                margin-bottom: 6px;
                position: relative;
                animation: balonPop 0.3s ease-out;
            }
            .balon::after {
                content: '';
                position: absolute;
                bottom: -6px;
                left: 50%;
                transform: translateX(-50%);
                border-width: 6px 6px 0;
                border-style: solid;
                border-color: white transparent transparent transparent;
            }
            @keyframes balonPop {
                from { transform: scale(0); }
                to { transform: scale(1); }
            }
            .isim-etiketi {
                background: rgba(0,0,0,0.75);
                color: #fde68a;
                font-size: 11px;
                font-weight: bold;
                padding: 2px 6px;
                border-radius: 6px;
                margin-bottom: 3px;
                white-space: nowrap;
            }
            .kafa {
                width: 48px;
                height: 48px;
                border-radius: 50%;
                border: 3px solid white;
                object-fit: cover;
                background: #222;
                z-index: 2;
            }
            /* Geleneksel Kıyafetli Vücut ve Kollar */
            .vucut {
                width: 36px;
                height: 40px;
                background: linear-gradient(180deg, #dc2626 0%, #991b1b 100%);
                border-radius: 10px 10px 4px 4px;
                margin-top: -5px;
                position: relative;
                border: 2px solid #fef08a;
                display: flex;
                justify-content: center;
            }
            /* Halay Tutan Kollar */
            .vucut::before, .vucut::after {
                content: '';
                position: absolute;
                top: 6px;
                width: 24px;
                height: 8px;
                background: #dc2626;
                border-radius: 4px;
            }
            .vucut::before { left: -20px; transform: rotate(-20deg); }
            .vucut::after { right: -20px; transform: rotate(20deg); }
            /* Halay Başı Özel Tasarımı */
            .halay-basi .kafa {
                width: 62px;
                height: 62px;
                border: 4px solid #fbbf24;
                box-shadow: 0 0 15px #fbbf24;
            }
            .halay-basi .vucut {
                width: 44px;
                height: 48px;
                background: linear-gradient(180deg, #f59e0b 0%, #b45309 100%);
            }
            .mendil {
                position: absolute;
                right: -34px;
                top: -12px;
                font-size: 26px;
                animation: mendilSalla 0.3s infinite alternate;
            }
            @keyframes mendilSalla {
                from { transform: rotate(-25deg) scale(1); }
                to { transform: rotate(25deg) scale(1.2); }
            }
            /* Alt Halay Başı Duyurusu */
            #duyuru {
                position: absolute;
                bottom: 25px;
                left: 50%;
                transform: translateX(-50%);
                background: linear-gradient(90deg, transparent, rgba(0,0,0,0.85), transparent);
                color: #fde047;
                font-size: 24px;
                font-weight: 900;
                padding: 10px 40px;
                text-shadow: 0 2px 10px rgba(0,0,0,0.9);
                white-space: nowrap;
                z-index: 100;
            }
        </style>
    </head>
    <body>
        <div class="ust-bilgi">❤️ <span id="begeni-sayaci">0</span> BEĞENİ YAP HALAYA KATIL :)</div>

        <div class="dev-banner">
            YAYINDAYIZ HALAYA KOŞŞ 💃
            <div class="alt-kural">Yoruma "halay" yaz katıl • Hediye at Halay Başı ol!</div>
        </div>

        <div id="meydan"></div>

        <div id="duyuru">Halay başı bekleniyor... (Hediye at!)</div>

        <script src="/socket.io/socket.io.js"></script>
        <script>
            const socket = io();
            const meydan = document.getElementById('meydan');
            const duyuru = document.getElementById('duyuru');
            const begeniSayaci = document.getElementById('begeni-sayaci');
            
            let oyuncular = []; // Halka içindeki oyuncular
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
let mevcut = oyuncular.find(o => o.isim === data.isim);
if (mevcut) {
if (basiMi) {
oyuncular = oyuncular.filter(o => o.isim !== data.isim);
oyuncular.unshift({ ...data, basiMi: true });
const eskiEl = document.getElementById('oyuncu-' + data.isim);
if (eskiEl) eskiEl.remove();
} else {
return;
}
} else {
if (basiMi) {
oyuncular.unshift({ ...data, basiMi: true });
} else {
oyuncular.push({ ...data, basiMi: false });
}
}
if (oyuncular.length > 25) {
const cikan = oyuncular.pop();
const cikanEl = document.getElementById('oyuncu-' + cikan.isim);
if (cikanEl) cikanEl.remove();
}
const div = document.createElement('div');
div.id = 'oyuncu-' + data.isim;
div.className = basiMi ? 'karakter halay-basi' : 'karakter';
div.innerHTML = `
${basiMi ? '👑 ' : ''}${data.isim}

${basiMi ? '🧣' : ''}
`;
meydan.appendChild(div);
if (basiMi) {
duyuru.innerText = `🔥 ${data.isim} halay başı oldu! 🔥`;
}
}
function balonGoster(isim, mesaj) {
const el = document.getElementById('oyuncu-' + isim);
if (!el) return;
const eskiBalon = el.querySelector('.balon');
if (eskiBalon) eskiBalon.remove();
const balon = document.createElement('div');
balon.className = 'balon';
balon.innerText = mesaj;
el.prepend(balon);
setTimeout(() => {
if (balon) balon.remove();
}, 5000);
}
socket.on('halayaKatil', d => oyuncuEkle(d, false));
socket.on('halayBasiYap', d => oyuncuEkle(d, true));
socket.on('yorumGeldi', d => {
balonGoster(d.isim, d.mesaj);
});
socket.on('begeniGeldi', sayi => {
toplamBegeni += sayi;
begeniSayaci.innerText = toplamBegeni;
});



`);
});
server.listen(process.env.PORT || 3000);
