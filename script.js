// الإعدادات الشاملة (10 أزرار + IP)
let config = JSON.parse(localStorage.getItem('ibrahimConfig')) || {
    pc_ip: "192.168.1.5",
    pc_port: "8080",
    smart: { count: 2, interval: 400 },
    btns: {
        t1: { name: 'فاتورة', key: 'F5', ae: true },
        t2: { name: 'حذف', key: 'Delete', ae: false },
        b3: { name: 'B3', key: 'F1', ae: false },
        b4: { name: 'B4', key: 'F2', ae: false },
        b5: { name: 'B5', key: 'F3', ae: false }
    }
};

const scanner = {
    reader: new ZXing.BrowserMultiFormatReader(),
    async start() {
        try {
            const devices = await this.reader.listVideoInputDevices();
            const backCam = devices.find(d => d.label.toLowerCase().includes('back')) || devices[devices.length - 1];
            this.reader.decodeFromVideoDevice(backCam.deviceId, 'video', (res) => {
                if (res) { logic.send(res.text); ui.feedback(); }
            });
        } catch (e) { console.error(e); }
    },
    async toggleFlash() {
        const track = document.getElementById('video').srcObject.getVideoTracks()[0];
        if (track.getCapabilities().torch) track.applyConstraints({ advanced: [{ torch: !track.getSettings().torch }] });
    }
};

const logic = {
    send(data) {
        const url = `http://${config.pc_ip}:${config.pc_port}/send?cmd=${encodeURIComponent(data)}`;
        fetch(url, { mode: 'no-cors' }).catch(() => {});
    },
    execBtn(id) {
        const b = config.btns[id];
        this.send(b.key);
        if (b.ae) setTimeout(() => this.send('Enter'), 200);
    },
    execSmartEnter() {
        let i = 0;
        const t = setInterval(() => {
            this.send('Enter');
            if (++i >= config.smart.count) clearInterval(t);
        }, config.smart.interval);
    }
};

const ui = {
    feedback() {
        const s = document.getElementById('scanner-box').style;
        s.borderColor = '#00ff00'; setTimeout(() => s.borderColor = '', 300);
    },
    toggleBatch(s) {
        document.getElementById('batch-container').classList.toggle('hidden', !s);
        if (s) document.getElementById('batch-input').focus();
    },
    focusKeyboard() { this.toggleBatch(true); },
    openSettings() {
        document.getElementById('set-ip').value = config.pc_ip;
        let html = '';
        for (let id in config.btns) {
            let b = config.btns[id];
            html += `<div class="setting-card">
                <h4>تعديل زر ${id.toUpperCase()}</h4>
                الاسم: <input id="n-${id}" value="${b.name}">
                الأمر: <input id="k-${id}" value="${b.key}">
                <label><input type="checkbox" id="ae-${id}" ${b.ae?'checked':''}> Auto-Enter</label>
            </div>`;
        }
        document.getElementById('config-list').innerHTML = html;
        document.getElementById('settings-page').classList.remove('hidden');
    },
    saveSettings() {
        config.pc_ip = document.getElementById('set-ip').value;
        for (let id in config.btns) {
            config.btns[id].name = document.getElementById(`n-${id}`).value;
            config.btns[id].key = document.getElementById(`k-${id}`).value;
            config.btns[id].ae = document.getElementById(`ae-${id}`).checked;
            document.getElementById(`btn-${id}`).innerText = config.btns[id].name;
        }
        localStorage.setItem('ibrahimConfig', JSON.stringify(config));
        document.getElementById('settings-page').classList.add('hidden');
    }
};

document.getElementById('batch-input').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') { logic.send(e.target.value); logic.send('Enter'); e.target.value = ''; }
});

window.onload = () => {
    scanner.start();
    for (let id in config.btns) document.getElementById(`btn-${id}`).innerText = config.btns[id].name;
};
