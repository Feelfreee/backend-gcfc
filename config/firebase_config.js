const admin = require("firebase-admin");

const serviceAccount = require("./feelfreee-999fd-firebase-adminsdk-x5l6j-0130bd8c37.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket:"gs://feelfreee-999fd.appspot.com" 
});

module.exports = admin;