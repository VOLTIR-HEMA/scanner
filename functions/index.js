const mongoose = require('mongoose');

// الرابط بتاعك من مونجو (تأكد من وضع الباسوورد الصحيحة)
const mongoURI = "mongodb+srv://justscan_db_user:Hema@2003@justscan.9w2pw5s.mongodb.net/?appName=JustScan";

exports.handler = async (event, context) => {
    try {
        // الاتصال بمونجو
        if (mongoose.connection.readyState !== 1) {
            await mongoose.connect(mongoURI);
        }

        // لو العملية "مسح كود" (POST)
        if (event.httpMethod === "POST") {
            const data = JSON.parse(event.body);
            // هنا السيرفر بيستلم الكود من الموبايل
            console.log("تم استلام كود:", data.code);
            
            return {
                statusCode: 200,
                body: JSON.stringify({ message: "تم الاستلام بنجاح يا إبراهيم" }),
            };
        }

        return {
            statusCode: 200,
            body: JSON.stringify({ message: "سيرفر إبراهيم يعمل بنجاح" }),
        };
    } catch (error) {
        return { statusCode: 500, body: error.toString() };
    }
};
