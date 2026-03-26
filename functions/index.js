const mongoose = require('mongoose');

// ضع رابط المونجو الخاص بك هنا وتأكد من كتابة الباسوورد
const mongoURI = "رابط_مونجو_الخاص_بك_هنا";

exports.handler = async (event, context) => {
    // الاتصال بقاعدة البيانات
    if (mongoose.connection.readyState !== 1) {
        await mongoose.connect(mongoURI);
    }

    // إذا كان الموبايل يرسل كود ممسوح (POST)
    if (event.httpMethod === "POST") {
        const data = JSON.parse(event.body);
        return {
            statusCode: 200,
            body: JSON.stringify({ status: "success", received: data.code }),
        };
    }

    // استجابة افتراضية للتأكد أن السيرفر يعمل
    return {
        statusCode: 200,
        body: JSON.stringify({ message: "سيرفر VOLTIR يعمل بنجاح يا إبراهيم" }),
    };
};
