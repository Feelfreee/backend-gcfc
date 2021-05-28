const fetch = require("node-fetch")
const configs = require("../.env.json")
const admin = require("../config/firebase_config")



 const fct_login = async(req, res) => {
    // get request input
  const { uid,secret } = req.body;

  if(configs.auth0_sync_id == secret){

    admin
    .auth()
    .createCustomToken(uid)
    .then((customToken) => {
     

      return res.status(200).json({
        fct:customToken
      });
    })
    .catch((error) => {
      return res.status(400).json({
        message:"error creating token",
        error:error
      });
    });

  }else{
    return res.status(400).json({
      message:"uuid mismatch",
    });
  }

  }

 const send_post = async(req,res) => {

 }
  module.exports = {
   fct_login
      }