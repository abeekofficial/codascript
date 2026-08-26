const mongoose = require('mongoose');
const uri = 'mongodb+srv://admin:27w4v4c8zQW2r6n4@codascript.zvzblhl.mongodb.net/codascript?retryWrites=true&w=majority&appName=codascript';
mongoose.connect(uri).then(() => {
    return mongoose.connection.db.collection('problems').updateOne(
      { slug: 'ikki-son-yigindisi' },
      { $set: { 'starterCode.javascript': '// Ikki son yig\'indisini hisoblovchi funksiya\nconst [a, b] = INPUT.split(\',\').map(Number);\n\n// Natijani console.log() orqali chiqaring:\nconsole.log( /* shu yerga yozing */ );\n' } }
    );
}).then((res) => { console.log(res); process.exit(0); }).catch((e) => { console.error(e); process.exit(1); });
