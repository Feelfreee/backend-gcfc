const fetch = require("node-fetch")


const post_sentiments = async(req,res)=>{
    //console.log(req.body.event.data);
    let description = req.body.event.data.new.description;
    let post_id = req.body.event.data.new.id;
    
    //sending data to http://symbl.ai/
    const app_id = '6330376e6c5a3977374146796c3876503837655649716f47773356685a4b5079';
    const app_secret =  '4c77336a616e5a694c417364505144704f69532d4a487152354e68364c70416f74644267555851665557634d6d633178377775416139696664664c5166302d6a';      
    
    fetch(
     "https://api.symbl.ai/oauth2/token:generate",
     {
       method: 'POST',
       body: JSON.stringify({
      "type": "application",
      "appId":app_id,
      "appSecret":app_secret
      }),
       headers: { 'Content-Type': 'application/json'
   },
     } 
   ).then(response => response.json())
   .then(token => {
      const symb_jwt_token = token.accessToken;
      const data_to_give = String(description)
      console.log(typeof data_to_give,3656)
        fetch(
     "https://api.symbl.ai/v1/process/text",
     {
       method: 'POST',
       body: JSON.stringify({    
    "messages": [
      {
        "payload": {
          "content": `${data_to_give}`,
          "contentType": "text/plain"
        }
      }
    ]
  
      }),
       headers: { 'Content-Type': 'application/json',
                  'Authorization': `Bearer ${symb_jwt_token}`
   },
     }
   ).then(response => response.json())
   .then(job_id => {
          const get_job_id = job_id.conversationId
          
          //
    fetch(
     `https://api.symbl.ai/v1/conversations/${get_job_id}/topics?sentiment=true&parentRefs=true`,
     {
       method: 'GET',
       headers: { 'Content-Type': 'application/json','Authorization': `Bearer ${symb_jwt_token}`},
     }
   ).then(response => response.json())
   .then(data => {
     // console.log(data,8989);
      
      let data_symbl = data;
      
      
      let polarity = 0;
   
  
  data_symbl.topics.forEach(j =>{
  polarity +=j.sentiment.polarity.score;
  })
  
  //console.log(polarity,78,post_id,data_symbl,description);
      
        const hasura_update_polarity = `
  mutation {
    update_posts_by_pk(pk_columns: {id: "${post_id}"}, _set: {polarity:"${polarity}"}) {
      description
      polarity
    }
  }
  `
        
              //updating hasura post
      fetch(
     "https://feelfree12.herokuapp.com/v1/graphql",
     {
       method: 'POST',
       body: JSON.stringify({
         query: hasura_update_polarity
       }),
       headers: { 'Content-Type': 'application/json',
                  'x-hasura-admin-secret':'25a779ba-116e-47a2-9272-458f30af0449'
   },
     }
   ).then(response => response.json())
   .then(ratings => {
        
       // console.log(hasura_update_polarity,5656888989)
        return res.status(200).json({
          message:"Updated polarity"
        })
        
      })
      .catch(err => console.log(err));
      
      //        
            })
    .catch(err => console.log(err))      
          //
        })
    .catch(err =>{console.log(err)})  
      
      
    })
    .catch(err => console.log(12121,err));
    
  }


  module.exports = {
      post_sentiments
  }