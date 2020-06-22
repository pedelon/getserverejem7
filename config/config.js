// ======================
//       puerto
// ======================

process.env.PORT = process.env.PORT || 3000;


// ======================
//       entorno
// ======================

process.env.NODE_ENV = process.env.NODE_ENV || 'dev';


// ======================
// Vencimiento del Token
// ======================

process.env.CADUCIDAD_TOKEN = 60 * 60 * 24 * 30;


// ===========================
//    SEED de autenticación
// ===========================

process.env.SEED = process.env.SEED || 'este-es-el-seed-desarrollo';


// ======================
//    Base de Datos
// ======================

if (process.env.NODE_ENV === 'dev') {
    urlDB = 'mongodb://localhost:27017/cafe';
} else {
    urlDB = process.env.MONGO_URI;
}

process.env.URLDB = urlDB;


// ===========================
//    google client ID
// ===========================

process.env.CLIENT_ID = process.env.CLIENT_ID || '343679289985-ltmc4gl4a2i182jueicp3kit9c3v7uul.apps.googleusercontent.com';