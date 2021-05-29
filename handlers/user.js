const fetch = require("node-fetch")
const configs = require("../.env.json")
const admin = require("../config/firebase_config")

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

 const get_post = async(req,res) => {

  const { limit,offset,updated_at,polarity } = req.body.input;

  const HASURA_OPERATION = `
  {
    posts(limit:${limit}, offset: ${offset}, order_by: {updated_at: ${updated_at}, polarity: ${polarity}}) {
      description
      id
      created_at
      picture
      polarity
      posted_by
      random_name
      updated_at
      posts_helpers {
        helper_id
      }
    }
  }
  
`;
const fetchResponse = await fetch(
  "https://feelfree12.herokuapp.com/v1/graphql",
  {
    method: 'POST',
    body: JSON.stringify({
      query: HASURA_OPERATION
    }),
    headers: { 'Content-Type': 'application/json',
               'x-hasura-admin-secret':'25a779ba-116e-47a2-9272-458f30af0449'
},
  }
);
const posts = [];
const data = await fetchResponse.json();

data.data.posts.forEach(j=>{
  posts.push({
    description:j.description,
    id:j.id,
    created_at:j.created_at,
    picture:j.picture,
    random_name:j.random_name,
    helpers:{
      "helper_id":j.posts_helpers
    }
  })
})
const data1 = {posts};
console.log('DEBUG: ', data);
return res.status(200).json({
  posts:data1.posts
});



 }

 const help_in_post = async (req,res) => {

  const { helper_id, post_id, text } = req.body.input;

   const HASURA_OPERATION_INSERT = `
mutation {
  insert_posts_helpers_one(object: {helper_id: "${helper_id}", post_id: "${post_id}", text: "${text}"}) {
    id
  }
}
`
  const HASURA_GET_POST = `
 {
  posts_by_pk(id: "${post_id}") {
    posted_by
  }
}
`
  
  console.log(HASURA_GET_POST);
   
  const fetchResponse = await fetch(
    "https://feelfree12.herokuapp.com/v1/graphql",
    {
      method: 'POST',
      body: JSON.stringify({
        query: HASURA_GET_POST
      }),
      headers: { 'Content-Type': 'application/json',
                 'x-hasura-admin-secret':'25a779ba-116e-47a2-9272-458f30af0449'
  },
    }
  );

    const post_details = await fetchResponse.json();
    console.log(post_details);
    const post_user_id = post_details.data.posts_by_pk.posted_by;
    
    if(post_user_id !== helper_id){

      const insert_post_helper = await fetch(
        "https://feelfree12.herokuapp.com/v1/graphql",
        {
          method: 'POST',
          body: JSON.stringify({
            query: HASURA_OPERATION_INSERT
          }),
          headers: { 'Content-Type': 'application/json',
                     'x-hasura-admin-secret':'25a779ba-116e-47a2-9272-458f30af0449'
      },
        }
      );

      const response = await insert_post_helper.json()
      console.log(response);
      return res.status(200).json({
        message:`Request user for chat !`
      })

    }else{
      res.status(403).json({
        message:"You cannot help in your own post !"
      })
    } 

 }


  module.exports = {
   fct_login,
   get_post,
   help_in_post
      }