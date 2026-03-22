// --- تحميل الإعدادات من ذاكرة الموبايل ---
let config = JSON.parse(localStorage.getItem('ibrahimConfig')) || {
    pc_ip: "192.168.1.5", // الـ IP الافتراضي
    pc_port: "8080",
    plus: { name: 'فاتورة', key: 'F5', autoEnter: true },
    del: { name: 'حذف', key: 'Delete', autoEnter: false },
    smart: { count: 2, interval: 400 }
};

// --- نظام السكانر ---
const scanner = {
    reader: new ZXing.BrowserMultiFormatReader(),
    async start() {
        const devices = await this.reader.listVideoInputDevices();
        const backCam = devices.find(d => d.label.toLowerCase().includes('back')) || devices[devices.length - 1];
        this.reader.decodeFromVideoDevice(backCam.deviceId, 'video', (result) => {
            if (result) {
                logic.send(result.text);
                ui.feedback();
            }
        });
    }
};

// --- منطق الإرسال (بيقرأ الـ IP من الـ config المحفوظ) ---
const logic = {
    send(data) {
        console.log("إرسال:", data);
        const url = `http://${config.pc_ip}:${config.pc_port}/send?cmd=${encodeURIComponent(data)}`;
        fetch(url, { mode: 'no-cors' }).catch(err => console.log("خطأ اتصال"));
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

// --- الواجهة والإعدادات ---
const ui = {
    feedback() {
        const box = document.getElementById('scanner-box');
        box.style.borderColor = '#00ff00';
        setTimeout(() => box.style.borderColor = '', 300);
    },
    toggleBatch(show) {
        document.getElementById('batch-container').classList.toggle('hidden', !show);
        if (show) document.getElementById('batch-input').focus();
    },
    openSettings() {
        const list = document.getElementById('config-list');
        list.innerHTML = `
            <div class="setting-card" style="background:#333; padding:10px; margin-bottom:10px; border-radius:8px;">
                <h4 style="color: #4CAF50;">ربط الجهاز (IP)</h4>
                IP الكمبيوتر: <input id="set-pc-ip" type="text" value="${config.pc_ip}">
            </div>
            <div class="setting-card" style="background:#333; padding:10px; margin-bottom:10px; border-radius:8px;">
                <h4>زر الزائد (+)</h4>
                الاسم: <input id="set-plus-name" type="text" value="${config.plus.name}">
                الأمر: <input id="set-plus-key" type="text" value="${config.plus.key}">
                <label><input type="checkbox" id="set-plus-ae" ${config.plus.autoEnter ? 'checked' : ''}> Enter تلقائي</label>
            </div>
            <div class="setting-card" style="background:#333; padding:10px; border-radius:8px;">
                <h4>الإنتر الذكي</h4>
                العدد: <input id="set-smart-count" type="number" value="${config.smart.count}">
            </div>
        `;
        document.getElementById('settings-page').classList.remove('hidden');
    },
    saveSettings() {
        config.pc_ip = document.getElementById('set-pc-ip').value;
        config.plus.name = document.getElementById('set-plus-name').value;
        config.plus.key = document.getElementById('set-plus-key').value;
        config.plus.autoEnter = document.getElementById('set-plus-ae').checked;
        config.smart.count = parseInt(document.getElementById('set-smart-count').value);
        
        localStorage.setItem('ibrahimConfig', JSON.stringify(config));
        document.getElementById('settings-page').classList.add('hidden');
        document.getElementById('btn-plus').innerText = config.plus.name;
    }
};

document.getElementById('batch-input').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        logic.send(e.target.value);
        logic.send('Enter');
        e.target.value = '';
    }
});

window.onload = () => {
    scanner.start();
    document.getElementById('btn-plus').innerText = config.plus.name;
};
