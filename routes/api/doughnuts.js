var Joi   = require('joi');
var Auth  = require('./auth');

exports.register = function (server, options, next) {
  server.route([
    {
      method: 'GET', // INDEX. Get (read/retreive) all doughnuts
      path: '/api/doughnuts',
      handler: function (request, reply) {
        var db = request.server.plugins['hapi-mongodb'].db;

        db.collection('doughnuts').find().toArray(function (err, results) {
          if (err) {
            return reply(err).code(400);
          }
          reply(results).code(200);
        });
      }
    },
    {
      method: 'GET', // Get doughnuts for a specific user
      path: '/api/{username}/doughnuts',
      handler: function (request, reply) {
        var db = request.server.plugins['hapi-mongodb'].db;

        var username = request.params.username;

        // search the username, and extract the ID of the user (user_id)
        db.collection('users').findOne({username: username}), function (err, user) {
          if (err) {
            return reply(err).code(400);
          }

          // check if user exists
          if (user === null) {
            return reply({message: "User Not Found"}).code(404);
          }

          // given the user_id, we will find all the doughnuts with this user_id
          var user_id = user._id;

          db.collection('doughnuts').find({user_id: user_id}).toArray(function (err, results) {
            if (err) {
              return reply(err).code(400);
            }
            reply(results).code(200);
          });
        };
      }
    },
    {
      method: 'POST',  // Create doughnut
      path: '/api/doughnuts',
      handler: function (request, reply) {
        Auth.authenticated(request, function (result) {
          if (result.authenticated) {
            var db       = request.server.plugins['hapi-mongodb'].db;
            var session  = request.yar.get('hapi_doughnuts_session');
            var ObjectID = request.server.plugins['hapi-mongodb'].ObjectID;

            var createDoughnut = {
              user_id : ObjectID(session.user_id),
              flavor  : request.payload.flavor,
              style   : request.payload.style
            };

            db.collection('doughnuts').insert(createDoughnut, function (err, doc) {
              if (err) {
                return reply(err).code(400);
              }
              reply(doc.ops[0]).code(200);
            });
          } else {
            // can't create a post if not logged in
            reply(result).code(400);
          }
        });
      }
    },
    {
      method: 'DELETE', // Remove doughnut
      path: '/api/doughnuts/{id}',
      handler: function (request, reply) {
        Auth.authenticated(request, function (result) {
          if (result.authenticated) {
            var db        = request.server.plugins['hapi-mongodb'].db;
            var ObjectID  = request.server.plugins['hapi-mongodb'].ObjectID;
            var session   = request.yar.get('hapi_doughnuts_session');

            var findDoughnut = {
              id     : ObjectID(request.params.id),  // doughnut ID
              user_id: ObjectID(session.user_id)    // user ID
            };

            // find the doughnut
            db.collection('doughnuts').findOne({"_id": findDoughnut.id}, function (err, doughnut) {
              if (err) {
                return reply(err).code(400);
              }

              // check if the doughnut exists
              if (doughnut === null) {
                return reply ({message: "There is no doughnut"}).code(404);
              }
              // if doughnut's user_id is the same as current user then remove doughnut
              if (doughnut.user_id.toString() === findDoughnut.user_id.toString()) { // your doughnut
                db.collection('doughnuts').remove({"_id": findDoughnut.id}, function (err, doc) {
                  if (err) {
                    return reply(err).code(400);
                  }
                  reply(doc).code(200);
                });
              } else { // not your doughnut
                reply({message: "This is not your doughnut"}).code(400);
              }
            });
          } else { // can't delete if not logged in
            reply(result).code(400);
          }
        })
      }
    },
    {
      method: 'PUT', // updating existing doughnut
      path: '/api/doughnuts/{id}',
      handler: function (request, reply) {
        Auth.authenticated(request, function (result) {
          if (result.authenticated) {
            var db        = request.server.plugins['hapi-mongodb'].db;
            var ObjectID  = request.server.plugins['hapi-mongodb'].ObjectID;
            var session   = request.yar.get('hapi_doughnuts_session');

            var id        = ObjectID(request.params.id);

            var updateDoughnut = {
              style:  request.payload.style,
              flavor: request.payload.flavor
            };

            db.collection('doughnuts').findOne({"_id": id}, function (err, doughnut) {
              if (err) {
                return reply(err).code(400);
              }
              if (doughnut === null) {
                return reply ({message: "There is no doughnut"}).code(404);
              }

              if (doughnut.user_id.toString() === user_id.toString()) {
                db.collection('doughnuts').update({"_id": id}, {$set: updateDoughnut}, function (err, doughnut) {  // set prevents the id from being updated
                  if (err) {
                    return reply(err).code(400);
                  }
                  reply(doughnut).code(200);
                });
              } else {
                reply({message: "This is not your doughnut"}).code(400);
              }
            });
          } else {
            reply(result).code(400);
          }
        });
      }
    }
  ]);

  next();
};

exports.register.attributes = {
  name: 'doughnuts-api',
  version: '0.0.1'
};