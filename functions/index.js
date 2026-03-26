const mongoose = require('mongoose');
const mongoURI = "mongodb+srv://justscan_db_user:justscan2026@justscan.9w2pw5s.mongodb.net/VoltIR?retryWrites=true&w=majority";

const UserSchema = new mongoose.Schema({
    phone: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    expiryDate: { type: Date, default: () => new Date(+new Date() + 3*24*60*60*1000) }, // 3 أيام تجربة
    timestamp: { type: Date, default: Date.now }
});

const User = mongoose.models.User || mongoose.model('User', UserSchema);

exports.handler = async (event) => {
    try {
        if (mongoose.connection.readyState !== 1) await mongoose.connect(mongoURI);

        if (event.httpMethod === "GET") {
            const users = await User.find({}).sort({ timestamp: -1 });
            return { statusCode: 200, headers: {"Access-Control-Allow-Origin": "*"}, body: JSON.stringify(users) };
        }

        const data = JSON.parse(event.body);

        if (data.action === "register") {
            let user = await User.findOne({ phone: data.phone });
            if (user) return { statusCode: 400, body: JSON.stringify({ error: "الرقم مسجل مسبقاً" }) };
            user = new User({ phone: data.phone, password: data.password });
            await user.save();
            return { statusCode: 200, body: JSON.stringify({ message: "success" }) };
        }

        if (data.action === "login") {
            const user = await User.findOne({ phone: data.phone, password: data.password });
            if (!user) return { statusCode: 401, body: JSON.stringify({ error: "خطأ في الرقم أو الباسورد" }) };
            return { statusCode: 200, body: JSON.stringify({ message: "success" }) };
        }

        if (data.action === "activate") {
            const newExpiry = new Date(+new Date() + data.days * 24 * 60 * 60 * 1000);
            await User.findOneAndUpdate({ phone: data.phone }, { expiryDate: newExpiry });
            return { statusCode: 200, body: JSON.stringify({ message: "done" }) };
        }

        return { statusCode: 200, body: "OK" };
    } catch (e) {
        return { statusCode: 500, body: JSON.stringify({ error: e.message }) };
    }
};
