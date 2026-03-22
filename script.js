// إدارة الإعدادات والحفظ
let config = JSON.parse(localStorage.getItem('ibrahimConfig')) || {
    plus: { name: 'فاتورة', key: 'F5', autoEnter: true },
    del: { name: 'حذف', key: 'Delete', autoEnter: false },
    smart: { count: 2, interval: 400 }
};

const scanner = {
    reader: new ZXing.BrowserMultiFormatReader(),
    async start() {
        const devices = await this.reader.listVideoInputDevices();
        const backCam = devices.find(d => d.label.toLowerCase().includes('back')) || devices[devices.length - 1];
        this.reader.decodeFromVideoDevice(backCam.deviceId, 'video', (result) => {
            if (result) logic.send(result.text);
        });
    },
    async toggleFlash() {
        const track = document.getElementById('video').srcObject.getVideoTracks()[0];
        const cap = track.getCapabilities();
        if (cap.torch) {
            const status = !track.getSettings().torch;
            await track.applyConstraints({ advanced: [{ torch: status }] });
        }
    }
};

const logic = {
    send(data) {
        console.log("🚀 إرسال:", data);
        // هنا يتم الربط مع البرنامج المستلم على الكمبيوتر
        document.getElementById('scanner-box').style.borderColor = '#00ff00';
        setTimeout(() => document.getElementById('scanner-box').style.borderColor = '', 300);
    },
    execBtn(type) {
        const conf = config[type];
        this.send(conf.key);
        if (conf.autoEnter) setTimeout(() => this.send('Enter'), 150);
    },
    execSmartEnter() {
        let count = 0;
        const timer = setInterval(() => {
            this.send('Enter');
            count++;
            if (count >= config.smart.count) clearInterval(timer);
        }, config.smart.interval);
    }
};

const ui = {
    toggleBatch(show) {
        document.getElementById('batch-container').classList.toggle('hidden', !show);
        if (show) document.getElementById('batch-input').focus();
    },
    focusKeyboard() { this.toggleBatch(true); },
    openSettings() {
        const list = document.getElementById('config-list');
        list.innerHTML = `
            <div class="setting-card">
                <h3>زر الزائد (+)</h3>
                الاسم: <input id="set-plus-name" value="${config.plus.name}">
                الأمر: <input id="set-plus-key" value="${config.plus.key}">
                <label><input type="checkbox" id="set-plus-ae" ${config.plus.autoEnter ? 'checked' : ''}> Enter تلقائي</label>
            </div>
            <div class="setting-card">
                <h3>ماكرو الإنتر الذكي</h3>
                عدد الضغطات: <input type="number" id="set-smart-count" value="${config.smart.count}">
                الفاصل (ms): <input type="number" id="set-smart-int" value="${config.smart.interval}">
            </div>
        `;
        document.getElementById('settings-page').classList.remove('hidden');
    },
    saveSettings() {
        config.plus.name = document.getElementById('set-plus-name').value;
        config.plus.key = document.getElementById('set-plus-key').value;
        config.plus.autoEnter = document.getElementById('set-plus-ae').checked;
        config.smart.count = document.getElementById('set-smart-count').value;
        config.smart.interval = document.getElementById('set-smart-int').value;
        localStorage.setItem('ibrahimConfig', JSON.stringify(config));
        document.getElementById('settings-page').classList.add('hidden');
        location.reload(); // لتحديث الأسماء على الزراير
    }
};

// تشغيل مود الفاتورة عند ضغط Enter من الكيبورد
document.getElementById('batch-input').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        logic.send(e.target.value);
        logic.send('Enter');
        e.target.value = ''; 
    }
});

window.onload = () => scanner.start();