const express = require('express');
const {createServer} = require("http");
const {makeExecutableSchema} = require("@graphql-tools/schema");
const {SubscriptionServer} = require("subscriptions-transport-ws");
const{execute,subscribe} = require("graphql");
const {ApolloServer} = require("apollo-server-express");
const typeDefs = require('./graphql/typeDefs.js');
const resolvers = require('./graphql/resolvers.js');

(async function(){
  const app = express();
  const httpServer = createServer(app);
  const schema = makeExecutableSchema({
    typeDefs,
    resolvers
  });

  const subscriptionsServer = SubscriptionServer.create(
    {schema,execute,subscribe},
    {server:httpServer,path:'/graphql'}
  );

  const server = new ApolloServer({
    schema,
    plugins: [
      {
        async serverWillStart(){
          return{
            async drainServer(){
              subscriptionsServer.close();
            }
          }
        }
      }
    ]
  })

  await server.start();
  server.applyMiddleware({app});

  const PORT=4000;
  httpServer.listen(PORT,()=>
    console.log("Servidor corriendo en "+PORT)
  );
})();