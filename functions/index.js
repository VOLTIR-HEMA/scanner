const mongoose = require('mongoose');
const mongoURI = "mongodb+srv://justscan_db_user:justscan2026@justscan.9w2pw5s.mongodb.net/?appName=JustScan";

const UserSchema = new mongoose.Schema({
    phone: { type: String, unique: true, required: true },
    password: { type: String, default: "123" },
    expiryDate: { type: Date, default: () => new Date(+new Date() + 3*24*60*60*1000) }, // 3 أيام تجربة
    timestamp: { type: Date, default: Date.now }
});

const User = mongoose.models.User || mongoose.model('User', UserSchema);

exports.handler = async (event) => {
    try {
        if (mongoose.connection.readyState !== 1) await mongoose.connect(mongoURI);

        // لو الإدارة بتطلب البيانات (GET)
        if (event.httpMethod === "GET") {
            const users = await User.find({}).sort({ timestamp: -1 });
            return { statusCode: 200, body: JSON.stringify(users) };
        }

        // لو حد بيسجل أو بيمسح باركود (POST)
        const data = JSON.parse(event.body);

        if (data.action === "register") {
            // البحث عن المستخدم لو موجود مسبقاً، لو مش موجود ننشئه
            let user = await User.findOne({ phone: data.phone });
            if (!user) {
                user = new User({ phone: data.phone, password: data.password || "123" });
                await user.save();
            }
            return { statusCode: 200, body: JSON.stringify({ message: "تم التسجيل بنجاح" }) };
        }

        // أمر التفعيل من لوحة الإدارة
        if (data.action === "activate") {
            const newExpiry = new Date(+new Date() + data.days * 24 * 60 * 60 * 1000);
            await User.findOneAndUpdate({ phone: data.phone }, { expiryDate: newExpiry });
            return { statusCode: 200, body: JSON.stringify({ message: "تم التفعيل" }) };
        }

        return { statusCode: 200, body: "OK" };
    } catch (e) {
        return { statusCode: 500, body: JSON.stringify({ error: e.message }) };
    }
};
