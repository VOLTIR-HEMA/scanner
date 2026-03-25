const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// --- هنا المكان اللي هتحط فيه الرابط يا إبراهيم ---
// امسح السطر اللي تحت وحط الرابط بتاعك مكانه (ومتنساش تحط الباسوورد بدل كلمة <password>)
const mongoURI = "mongodb+srv://justscan_db_user:Hema@2003@justscan.9w2pw5s.mongodb.net/?appName=JustScan";

mongoose.connect(mongoURI)
  .then(() => console.log("✅ مبروك يا إبراهيم.. المتصل بقاعدة البيانات بنجاح!"))
  .catch(err => console.log("❌ فيه مشكلة في الرابط:", err));

app.get('/', (req, res) => res.send('سيرفر إبراهيم شغال تمام 🚀'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`السيرفر شغال على بورت ${PORT}`));