const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

app.use(express.static(__dirname)); // public klasörünü sun

io.on('connection', (socket) => {
    socket.on('chat message', (msg) => {
        io.emit('chat message', msg); // herkese gönder
    });
});

http.listen(3000, () => {
    console.log('Server running on http://localhost:3000');
});

