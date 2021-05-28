
 function getAllUsers(req, res) {
    // TODO: Get users from a database
    res.send(['Alice', 'Bob']);
  }
  
   function getUser(req, res) {
    // TODO: Get user details
    res.send({ name: 'Alice', location: 'LAX', });
  }
  
   function getDefault(req, res) { res.status(404).send('Bad URL'); }

  module.exports = {
getAllUsers,
getUser,
getDefault
  }