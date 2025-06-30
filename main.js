let nickname = null;
const socket = io();

const input = document.getElementById('input');
const output = document.getElementById('output');
const welcome = document.getElementById('welcome');
const inputLine = document.querySelector('.input-line');
const sendBtn = document.getElementById('sendBtn');

// Komutlar nesnesi
const commands = {
    help: (outputElement) => {
        outputElement.innerHTML += `
        <div class="other-message">
            <span class="neon">/nick {newNick}</span>: change nickname<br>
            <span class="neon">/clear</span>: clear the screen<br>
            <span class="neon">/color {color}</span>: change the interface color<br>
            <span class="neon">/help</span>: you obviously already know what this does<br>
            <span class="neon">/quit</span>: quit the chat<br>
        </div>`;
    },
   nick: (outputElement, args, state) => {
    if (!args || args.length < 2) {
        outputElement.innerHTML += `<div class="other-message">Nickname must be at least 2 characters.</div>`;
        return;
    }
    socket.emit('chat message', { nickname: state.nickname, text: `${state.nickname} is changed the nickname as ${args}`, system: true });
    state.nickname = args;
},
   quit: (outputElement, args, state) => {
    socket.emit('chat message', { nickname: state.nickname, text: `${state.nickname} is quit.`, system: true });
    setTimeout(() => location.reload(), 1000);
},
 clear: (outputElement, args, state) => {
        output.innerHTML = '';
        welcome.innerHTML = '';
        document.getElementById('banner').innerHTML = '';
    },
  color: (outputElement, args, state) => {
    if (!args) return;
    document.documentElement.style.setProperty('--main-green', args);
    document.documentElement.style.setProperty('--my-message-color', args);
    outputElement.innerHTML += `<div class="system-message">Interface color has changed: ${args}</div>`;
},
users: (outputElement, args, state) => {
    socket.emit('get users');
}
};

function printMessage(msg, sender = 'system') {
    const div = document.createElement('div');
    if (sender === 'system') {
        div.className = 'system-message';
    } else {
        div.className = sender === 'me' ? 'my-message' : 'other-message';
    }
    div.textContent = msg;
    output.appendChild(div);
    output.scrollTop = output.scrollHeight;
}

function askNickname() {
    welcome.innerHTML = "👁 You’ve entered a Temporary Autonomous Zone<br>Codename required. Press <span class='neon'>'Enter'</span> when ready.";
    input.placeholder = "Enter your nickname...";
}

function enterChat() {
    welcome.innerHTML = `<span class='neon'>${nickname}</span>, your presence is now felt.
Speak your truth and press Enter. To see the ancient commands, type <span class='neon'>/help</span>.`;
    input.placeholder = "Write your message...";
    document.querySelector('.prompt').textContent = `${nickname}@anon:~$`;
    socket.emit('chat message', { nickname, text: `${nickname} is joined us.`, system: true });
}
window.addEventListener('DOMContentLoaded', () => {
    // Banner animasyonu aynen kalsın
    const bannerEl = document.getElementById('banner');
    const lines = bannerEl.textContent.split('\n');
    bannerEl.textContent = '';
    let index = 0;
    const showNextLine = () => {
        if (index < lines.length) {
            const lineDiv = document.createElement('div');
            lineDiv.className = 'banner-line drop-in';
            lineDiv.textContent = lines[index];
            bannerEl.appendChild(lineDiv);
            index++;
            setTimeout(showNextLine, 70);
        } else {
            welcome.style.display = 'block';
            inputLine.style.display = 'flex';
            setTimeout(() => {
                welcome.classList.add('fade-in');
                inputLine.classList.add('fade-in');
                askNickname();
                input.focus();
            }, 300);
        }
    };
    showNextLine();
});

input.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') {
        const value = input.value.trim();
        if (!nickname) {
            if (value.length < 2) {
                alert("Please enter a nickname with at least 2 characters.");
                return;
            }
            nickname = value;
            input.value = '';
            enterChat();
        } else if (value) {
            if (value.startsWith('/')) {
                const [cmd, ...argsArr] = value.slice(1).split(' ');
                const args = argsArr.join(' ');
                const state = { nickname };
                if (commands[cmd]) {
                    commands[cmd](output, args, state);
                    if (cmd === 'nick' && state.nickname !== nickname) {
                        nickname = state.nickname;
                        document.querySelector('.prompt').textContent = `${nickname}@anon:~$`;
                    }
                } else {
                    printMessage("Unknown command. You can use /help .", 'system');
                }
                input.value = '';
                return;
            }
            socket.emit('chat message', { nickname, text: value });
            input.value = '';
        }
    }
});

// Gelen mesajları ekrana yaz
socket.on('chat message', (data) => {
    if (data.system) {
        printMessage(data.text, 'system');
    } else {
        printMessage(`${data.nickname}: ${data.text}`, data.nickname === nickname ? 'me' : 'other');
    }
});

document.getElementById('terminal').addEventListener('click', () => {
    input.focus();
});

sendBtn.addEventListener('click', function() {
    const event = new KeyboardEvent('keydown', { key: 'Enter' });
    input.dispatchEvent(event);
});
