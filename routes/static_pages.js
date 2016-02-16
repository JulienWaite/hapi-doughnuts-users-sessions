var Auth = require('./api/auth');

  exports.register = function (server, options, next) {
  // serving static files
  server.route([
    {
      method: 'GET',
      path: "/public/{path*}",
      handler: {
        directory: {
          path: 'public'
        }
      }
    },
    {
      // Login page
      method: 'GET',
      path: '/',
      handler: function(request, reply) {
        Auth.authenticated(request, function (result) {
          if (result.authenticated) {
            reply.redirect('/doughnuts').code(307);
          } else {
            reply.view('index', {message: request.query.message}).code(200);
          }
        });
      }
    },
    {
      // Retrieve all doughnuts
      method: 'GET',
      path: '/doughnuts',
      handler: function(request, reply) {
        Auth.authenticated(request, function (result) {
          if (result.authenticated) {
            reply.view('doughnuts').code(200);
          } else {
            reply.redirect('/?message=Please sign in first').code(307);
          }
        });
      }
    }
  ]);

  next();
};

exports.register.attributes = {
  name: 'static-files-api',
  version: '0.0.1'
};