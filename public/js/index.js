$(document).ready(function () {
  $('#signup').on('submit', function (e) {
    e.preventDefault();
    $('#signup-form-message').text(''); // clears message before submitting

    var user = {
      email   : $('#signup [name="email"]').val(),
      name    : $('#signup [name="name"]').val(),
      username: $('#signup [name="username"]').val(),
      password: $('#signup [name="password"]').val()
    };

    // console.log(email, name, username, password);

    // do validation here for the front end. (Bootstrap, HTML & JS)

    $.ajax({
      method: "POST",  // method was previously type but changed for consistency
      url: '/api/users',
      data: user,
      success: function (response) {
        console.log(response);
        $('#signup-form-message').text("Created User");
      },
      error: function (response) {
        console.log(response);
        $('#signup-form-message').text(response.responseJSON.message);
      }
    });
  });

  $('#signin').on('submit', function (e) {
    e.preventDefault();

    var user = {
      username: $('#signin [name="username"]').val(),
      password: $('#signin [name="password"]').val()
    };

    $.ajax({
      method: "POST",
      url: "/api/sessions",
      data: user,
      dataType: 'JSON',
      success: function(response){
        window.location.href = "/doughnuts";
        //console.log("create session / logged in", response);
      },
      error: function (response) {
        console.log(response);
      }
    });
  });

  // $.ajax({
  //   method: "GET",
  //   url: "/api/authenticated",
  //   success: function(response){
  //     if (response.authenticated) {
  //       window.location.href = "/doughnuts";
  //     }
  //   }
  // });
});