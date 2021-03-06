var Joi = require('joi'); // Object schema validation
var Bcrypt = require('bcrypt'); // Encryption / Hashing function

exports.register = function(server, options, next) {

  // Include routes
  server.route([
    {
      // Retrieve all users
      method: 'GET',
      path: '/api/users',
      handler: function(request, reply) {
        var db = request.server.plugins['hapi-mongodb'].db;

        db.collection('users').find().toArray(function(err, users) {
          if (err) {
            return reply('Internal MongoDB error', err).code(400);
          }
          reply(users).code(200);
        });
      }
    },
    {
      // Create a new user
      method: 'POST',
      path: '/api/users',
      config: {
        handler: function(request, reply) {
          var db = request.server.plugins['hapi-mongodb'].db;

          // Get user input parameters (username, email, password, name)
          var user = request.payload;

          // Check if there's an existing user with the same username or email
          var uniqUserQuery = { $or: [{username: user.username}, {email: user.email}] };

          db.collection('users').findOne(uniqUserQuery, function(err, userExist){
            if (userExist) {
              return reply('Error: Username/Email already exists', err).code(400);
            }

            // Now, add the new user into the database
            Bcrypt.genSalt(10, function(err, salt) {
              Bcrypt.hash(user.password, salt, function(err, hash) {
                user.password = hash;

                // Store hash in your password DB.
                db.collection('users').insert(user, function(err, doc) {
                  if (err) {
                    return reply('Internal MongoDB error', err).code(400);
                  }
                  reply(doc).code(200);
                });
              });
            });
          });
        },
        validate: {
          payload: {
            // Required, limited to 20 charaters
            username: Joi.string().max(20).required(),
            email:    Joi.string().email().max(50).required(),
            password: Joi.string().min(5).max(20).required(),
            name:     Joi.string().max(20).required()
          }
        }
      }
    },
    {
      // Retrieve one user
      method: 'GET',
      path: '/api/users/{username}',
      handler: function(request, reply) {
        // What is encodeURIComponent()? Visit http://stackoverflow.com/questions/75980/best-practice-escape-or-encodeuri-encodeuricomponent
        var username = encodeURIComponent(request.params.username);
        var db = request.server.plugins['hapi-mongodb'].db;

        db.collection('users').findOne({ "username": username }, function(err, user) {
          if (err) {
            return reply('Internal MongoDB error', err).code(400);
          }
          reply(user).code(200);
        })
      }
    }
  ]);

  next();
};

exports.register.attributes = {
  name: 'users-route',
  version: '0.0.1'
};

