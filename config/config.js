// ======================
//       puerto
// ======================

process.env.PORT = process.env.PORT || 3000;


// ======================
//       entorno
// ======================

process.env.NODE_ENV = process.env.NODE_ENV || 'dev';


// ======================
//    Base de Datos
// ======================

if (process.env.NODE_ENV === 'dev') {
    urlDB = 'mongodb://localhost:27017/cafe';
} else {
    urlDB = 'mongodb+srv://pedelon:ZZBL5M0A5hCxWZTu@cluster0-ojwkd.mongodb.net/cafe';
}

process.env.URLDB = urlDB;