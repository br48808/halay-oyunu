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

tiktok.on('chat', data => {
    if (data.comment.toLowerCase().includes('halay')) {
        io.emit('halayaKatil', {
            isim: data.uniqueId,
            resim: data.profilePictureUrl
        });
    }
});

tiktok.on('gift', data => {
    if (data.giftType === 1 && !data.repeatEnd) return;
    io.emit('halayBasiYap', {
        isim: data.uniqueId,
        resim: data.profilePictureUrl
    });
});

// TEST LİNKİ 1: Yorum yazmış gibi sıradan oyuncu ekler
app.get('/test-katil', (req, res) => {
    const no = Math.floor(Math.random() * 100);
    io.emit('halayaKatil', {
        isim: 'Izleyici_' + no,
        resim: 'https://dicebear.com' + no
    });
    res.send('Test oyuncusu halaya eklendi! TikTok LIVE Studio ekranina bakin.');
});

// TEST LİNKİ 2: Hediye atmış gibi Halay Başı ekler
app.get('/test-hediye', (req, res) => {
    const no = Math.floor(Math.random() * 100);
    io.emit('halayBasiYap', {
        isim: 'Kral_' + no,
        resim: 'https://dicebear.com' + no
    });
    res.send('Test Halay Basi eklendi! TikTok LIVE Studio ekranina bakin.');
});

app.get('/', (req, res) => {
    res.send(`
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <style>
            body { margin: 0; overflow: hidden; background: transparent; font-family: sans-serif; }
            #alan { position: absolute; bottom: 50px; left: 50px; display: flex; gap: 15px; align-items: flex-end; }
            .kisi { text-align: center; animation: zipla 0.5s infinite alternate; }
            .kisi img { width: 60px; height: 60px; border-radius: 50%; border: 3px solid white; background: #222; }
            .basi img { width: 85px; height: 85px; border: 4px solid gold; }
            .isim { background: rgba(0,0,0,0.7); color: white; font-size: 12px; padding: 2px 5px; border-radius: 4px; }
            @keyframes zipla { from { transform: translateY(0); } to { transform: translateY(-15px); } }
        </style>
    </head>
    <body>
        <div id="alan"></div>
        <script src="/socket.io/socket.io.js"></script>
        <script>
            const socket = io();
            const alan = document.getElementById('alan');
            const liste = new Set();

            function ekle(data, basiMi) {
                if (liste.has(data.isim) && !basiMi) return;
                const eski = document.getElementById('u-' + data.isim);
                if (eski) eski.remove();
                liste.add(data.isim);

                const div = document.createElement('div');
                div.id = 'u-' + data.isim;
                div.className = basiMi ? 'kisi basi' : 'kisi';
                div.innerHTML = '<div class="isim">' + (basiMi ? '🧣 ' : '') + data.isim + '</div><img src="' + data.resim + '">';
                
                basiMi ? alan.appendChild(div) : alan.prepend(div);
            }

            socket.on('halayaKatil', d => ekle(d, false));
            socket.on('halayBasiYap', d => ekle(d, true));
        </script>
    </body>
    </html>
    `);
});

server.listen(process.env.PORT || 3000);
