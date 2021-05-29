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
  const hasura_check_if_already_requested = `
{
  posts_helpers(where: {post_id: {_eq: "${post_id}"}, helper_id: {_eq: "${helper_id}"}}) {
    created_at
    helper_id
  }
}
  `
  
  const check_if_already_requested = await fetch(
    "https://feelfree12.herokuapp.com/v1/graphql",
    {
      method: 'POST',
      body: JSON.stringify({
        query: hasura_check_if_already_requested
      }),
      headers: { 'Content-Type': 'application/json',
                 'x-hasura-admin-secret':'25a779ba-116e-47a2-9272-458f30af0449'
  },
    }
  );

    const data_come_back = await check_if_already_requested.json();
   
//   let data_come_back = await check_if_already_requested1.json().data;
    //console.log(data_come_back.data.posts_helpers.length);
   if(data_come_back.data.posts_helpers.length !== 0){
   // console.log(85656)
           return res.status(200).json({
              message:`Help request already sent to user !`
                 })
   }
   
else{
   
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
    //console.log(post_details);
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
      //console.log(response);
      return res.status(200).json({
        message:`Request user for chat !`
      })

    }else{
      res.status(403).json({
        message:"You cannot help in your own post !"
      })
    }    
   }
  

 }


 const create_room = async (req,res) => {

  const { post_id, user_id, helper_id } = req.body.input;

 const hasura_check_if_room_exists = `
query MyQuery {
room_candidates(where: {post_id: {_eq: "${post_id}"}, user_id: {_eq: "${helper_id}"}}) {
  room_id
}
}
`
 
const hasura_create_room = `
mutation {
insert_rooms_one(object: {}) {
  id
}
}
`

 
const fetch_rooms = await fetch(
  "https://feelfree12.herokuapp.com/v1/graphql",
  {
    method: 'POST',
    body: JSON.stringify({
      query: hasura_check_if_room_exists
    }),
    headers: { 'Content-Type': 'application/json',
               'x-hasura-admin-secret':'25a779ba-116e-47a2-9272-458f30af0449'
},
  }
);

  const room_data = await fetch_rooms.json();
 //console.log("asas",room_data.data.room_candidates[0])
  
 
 
  if(room_data.data.room_candidates[0] !== undefined){
    const room_id = room_data.data.room_candidates[0].room_id;
    return res.status(200).json({
      roomId:room_id
    })
  }else{
    const create_room = await fetch(
  "https://feelfree12.herokuapp.com/v1/graphql",
  {
    method: 'POST',
    body: JSON.stringify({
      query: hasura_create_room
    }),
    headers: { 'Content-Type': 'application/json',
               'x-hasura-admin-secret':'25a779ba-116e-47a2-9272-458f30af0449'
},
  }
);
    
    const room_details = await create_room.json();
    //console.log(room_details);
    const room_id = room_details.data.insert_rooms_one.id
    
    const hasura_create_room_candidate_add_user = `
mutation {
insert_room_candidates_one(object: {created_by: "${user_id}", post_id: "${post_id}", room_id: "${room_id}", user_id: "${user_id}"}) {
  room_id
}
}
`
    
    const hasura_create_room_candidate_add_helper = `
mutation {
insert_room_candidates_one(object: {created_by: "${user_id}", post_id: "${post_id}", room_id: "${room_id}", user_id: "${helper_id}"}) {
  room_id
}
}
`
    
  const create_room_candidate_add_user = await fetch(
  "https://feelfree12.herokuapp.com/v1/graphql",
  {
    method: 'POST',
    body: JSON.stringify({
      query: hasura_create_room_candidate_add_user
    }),
    headers: { 'Content-Type': 'application/json',
               'x-hasura-admin-secret':'25a779ba-116e-47a2-9272-458f30af0449'
},
  }
);
    
  const create_room_candidate_add_helper = await fetch(
  "https://feelfree12.herokuapp.com/v1/graphql",
  {
    method: 'POST',
    body: JSON.stringify({
      query: hasura_create_room_candidate_add_helper
    }),
    headers: { 'Content-Type': 'application/json',
               'x-hasura-admin-secret':'25a779ba-116e-47a2-9272-458f30af0449'
},
  }
);
    
    console.log(create_room_candidate_add_helper,create_room_candidate_add_user);
    
    return res.status(200).json({
      roomId:room_id
    })
    
  }

}

const rate_user = async (req,res) => {

  const { helper_id, rating } = req.body.input;

  const hasura_get_user_id = `
{
 users(where: {uid: {_eq: "${helper_id}"}}) {
   rating
 }
}
`
  
 
fetch(
   "https://feelfree12.herokuapp.com/v1/graphql",
   {
     method: 'POST',
     body: JSON.stringify({
       query: hasura_get_user_id
     }),
     headers: { 'Content-Type': 'application/json',
                'x-hasura-admin-secret':'25a779ba-116e-47a2-9272-458f30af0449'
 },
   }
 ).then(response => response.json())
 .then(ratings => {
    //console.log(rating.data.users[0].rating);
  let prev_user_rating  = ratings.data.users[0].rating;
  console.log(prev_user_rating)
  
  let avg_rating = ((prev_user_rating + parseFloat(rating))/2).toFixed(2)
  
  //console.log(avg_rating,rating);
  
     const modify_user_rating = `
  mutation {
 update_users_by_pk(pk_columns: {uid: "${helper_id}"}, _set: {rating: "${avg_rating}"}) {
   rating
 }
}
  `
      fetch(
   "https://feelfree12.herokuapp.com/v1/graphql",
   {
     method: 'POST',
     body: JSON.stringify({
       query: modify_user_rating
     }),
     headers: { 'Content-Type': 'application/json',
                'x-hasura-admin-secret':'25a779ba-116e-47a2-9272-458f30af0449'
 },
   }
 ).then(response => response.json())
 .then(response => {
        //console.log(response)
   return res.status(200).json({
     message:"User rated successfully !"
   })
        
      })
  .catch(err =>{
        console.log(err);
      })
  
  }).catch(err=>{console.log(err)})
}




  module.exports = {
   fct_login,
   get_post,
   help_in_post,
   create_room,
   rate_user
      }