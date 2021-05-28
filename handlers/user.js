const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const fetch = require("node-fetch")


// execute the parent operation in Hasura
const execute = async (variables) => {

    const HASURA_OPERATION = `
mutation ($email: String!, $first_name: String!, $last_name: String!, $password: String!) {
  insert_users_one(object: {email: $email, first_name: $first_name, last_name: $last_name, password: $password}) {
    id
  }
}
`;

    const fetchResponse = await fetch(
      "https://feelfree12.herokuapp.com/v1/graphql",
      {
        method: 'POST',
        body: JSON.stringify({
          query: HASURA_OPERATION,
          variables
        }),
        headers: { 'Content-Type': 'application/json',
                   'x-hasura-admin-secret':'25a779ba-116e-47a2-9272-458f30af0449'
    },
      }
    );
    const data = await fetchResponse.json();
    console.log('DEBUG: ', data);
    return data;
  };
    
  const get_profile_info = async (variables) => {
    const check_users = `
    query($username: String!) {
  users(where: {email: {_eq:$username}}) {
    email
    password
  }
    }
  `;
  
  const fetchResponse = await fetch(
    "https://feelfree12.herokuapp.com/v1/graphql",
    {
      method: 'POST',
      body: JSON.stringify({
        query: check_users,
        variables
      }),
      headers: { 'Content-Type': 'application/json',
      'x-hasura-admin-secret':'25a779ba-116e-47a2-9272-458f30af0449'
},
      
    }
  );
  const data = await fetchResponse.json();
  console.log('DEBUG: ', data);
  return data;
}

//express replies

 const signup = async (req, res) =>{
  // get request input
  const { email, first_name, last_name, password } = req.body.input;

  // run some business logic
  let hashedpass = await bcrypt.hash(password,10);
  
  console.log("adsdsadsa");
  

  // execute the Hasura operation
  const { data, errors } = await execute({ email, first_name, last_name, password:hashedpass });

  
  //giving back jwt
    const tokenContents = {
    sub: data.insert_users_one.id.toString(),
    name: first_name+last_name,
    iat: Date.now() / 1000,
    iss: 'https://myapp.com/',
    "https://hasura.io/jwt/claims": {
      "x-hasura-allowed-roles": ["user"],
      "x-hasura-user-id": data.insert_users_one.id.toString(),
      "x-hasura-default-role": "user",
      "x-hasura-role": "user"
    },
    exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60)
  }

  const token = jwt.sign(tokenContents, "asssssssssssssssssssssssssssssss");

  // if Hasura operation errors, then throw error
  if (errors) {
    return res.status(400).json(errors[0])
  }
  
  

  // success
  return res.json({
    ...data.insert_users_one,
    token:token
  })
}


 const login = async(req, res) => {
    // get request input
  const { username, password } = req.body.input;

  // run some business logic
  const { data, errors } = await get_profile_info({username});
  let passmatch = bcrypt.compareSync(password, data.users[0].password);
  console.log(data,data.users[0].password,passmatch)

  if(passmatch){
      //giving back jwt
      const tokenContents = {
        sub: username,
        name: username,
        iat: Date.now() / 1000,
        iss: 'New NM Cloudfunction deployed',
        "https://hasura.io/jwt/claims": {
          "x-hasura-allowed-roles": ["user"],
          "x-hasura-user-id": username,
          "x-hasura-default-role": "user",
          "x-hasura-role": "user"
        },
        exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60)
      }
    
      const token = jwt.sign(tokenContents, "asssssssssssssssssssssssssssssss");
    
      return res.json({
        accessToken: token
      })
    
  }else{
    return res.status(403).json({
      message: "Invalid credentials !"
    })
  }
  /*
  // In case of errors:
  return res.status(400).json({
    message: "error happened"
  })
  */

  }


  module.exports = {
   signup,
   login
      }