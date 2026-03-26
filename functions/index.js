const mongoose = require('mongoose');

// --- حط رابط المونجو بتاعك هنا مع الباسورد ---
const mongoURI = "mongodb+srv://justscan_db_user:justscan2026@justscan.9w2pw5s.mongodb.net/?appName=JustScan";

// تعريف جدول المستخدمين (Users)
const UserSchema = new mongoose.Schema({
    phone: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    expiryDate: { type: Date, default: () => new Date(+new Date() + 3*24*60*60*1000) }, // 3 أيام تجربة تلقائياً
    timestamp: { type: Date, default: Date.now }
});

const User = mongoose.models.User || mongoose.model('User', UserSchema);

exports.handler = async (event, context) => {
    try {
        if (mongoose.connection.readyState !== 1) await mongoose.connect(mongoURI);

        // --- 1. طلبات GET (لجلب البيانات للوحة الإدارة) ---
        if (event.httpMethod === "GET") {
            const users = await User.find({}).sort({ timestamp: -1 });
            return {
                statusCode: 200,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(users)
            };
        }

        // --- 2. طلبات POST (للتفعيل أو التسجيل) ---
        if (event.httpMethod === "POST") {
            const data = JSON.parse(event.body);

            // أمر التفعيل من لوحة الإدارة
            if (data.action === "activate") {
                const newExpiry = new Date(+new Date() + data.days * 24 * 60 * 60 * 1000);
                await User.findOneAndUpdate({ phone: data.phone }, { expiryDate: newExpiry });
                return { statusCode: 200, body: JSON.stringify({ message: "تم التفعيل" }) };
            }

            // أمر تسجيل حساب جديد (للمستخدمين)
            if (data.action === "register") {
                const newUser = new User({ phone: data.phone, password: data.password });
                await newUser.save();
                return { statusCode: 200, body: JSON.stringify({ message: "تم التسجيل" }) };
            }
        }

        return { statusCode: 200, body: "سيرفر الإدارة جاهز" };
    } catch (error) {
        return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
    }
};
