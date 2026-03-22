// --- إعدادات الربط (نفس نظام سكريبتك القديم) ---
let config = JSON.parse(localStorage.getItem('ibrahimConfig')) || {
    pc_ip: "192.168.1.5", // اكتب الـ IP بتاعك هنا من الموبايل
    pc_port: "8080",
    plus: { name: 'فاتورة', key: 'F5', autoEnter: true },
    smart: { count: 2, interval: 400 }
};

// --- منطق الإرسال (زي السكريبت القديم بالظبط) ---
const logic = {
    send(data) {
        console.log("إرسال للكمبيوتر:", data);
        // الرابط ده هو اللي سكريبت الجافا بتاعك بيفهمه
        const url = `http://${config.pc_ip}:${config.pc_port}/send?cmd=${encodeURIComponent(data)}`;
        
        fetch(url, { mode: 'no-cors' })
            .catch(err => console.log("تأكد من تشغيل سكريبت الجافا على الكمبيوتر"));
    },
    // ... باقي الوظائف (الزراير والإنتر الذكي) هتفضل شغالة عادي
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

// --- تشغيل الكاميرا (نفس المكتبة القديمة) ---
const scanner = {
    reader: new ZXing.BrowserMultiFormatReader(),
    async start() {
        const devices = await this.reader.listVideoInputDevices();
        const backCam = devices.find(d => d.label.toLowerCase().includes('back')) || devices[devices.length - 1];
        this.reader.decodeFromVideoDevice(backCam.deviceId, 'video', (result) => {
            if (result) {
                logic.send(result.text); // بيبعت الباركود لبرنامج الجافا بتاعك
                ui.feedback();
            }
        });
    }
};

// ... (باقي كود الـ UI ومود الفاتورة بيفضل زي ما هو)
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
            <div style="background:#333; padding:10px; border-radius:8px; margin-bottom:10px;">
                <h4>إعدادات الربط</h4>
                IP الكمبيوتر: <input id="set-pc-ip" type="text" value="${config.pc_ip}">
            </div>
            <div style="background:#333; padding:10px; border-radius:8px;">
                <h4>زر الزائد (+)</h4>
                الاسم: <input id="set-plus-name" type="text" value="${config.plus.name}">
                الأمر: <input id="set-plus-key" type="text" value="${config.plus.key}">
            </div>
        `;
        document.getElementById('settings-page').classList.remove('hidden');
    },
    saveSettings() {
        config.pc_ip = document.getElementById('set-pc-ip').value;
        config.plus.name = document.getElementById('set-plus-name').value;
        config.plus.key = document.getElementById('set-plus-key').value;
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
