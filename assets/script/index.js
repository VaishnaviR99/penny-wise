$(document).ready(function () {
  // Toggle between login and signup forms
  $(".switcher-login").click(function () {
    $(".form-wrapper").removeClass("is-active");
    $(this).parent().addClass("is-active");
  });

  $(".switcher-signup").click(function () {
    $(".form-wrapper").removeClass("is-active");
    $(this).parent().addClass("is-active");
  });

  // Notification function
  function notify(message, type = "success") {
    const notification = $("#notification");
    notification.removeClass("error").addClass(type === "error" ? "error" : "");
    notification.text(message).fadeIn();

    setTimeout(() => {
      notification.fadeOut();
    }, 3000);
  }

  // Signup form submission
  $(".form-signup").submit(function (e) {
    e.preventDefault();
    const name = $("#signup-username");
    const email = $("#signup-email");
    const password = $("#signup-password");
    var valid = true;

    // Clear previous error messages
    $(".error-message").text("");
    $(".input-block").removeClass(".error");

    if (name.val().trim() === "") {
      name.closest(".input-block").next(".error-message").text("Username is required.");
      name.closest(".input-block").addClass(".error");
      valid = false;
    }

    if (!validateEmail(email.val())) {
      email
        .closest(".input-block")
        .next(".error-message")
        .text("Invalid email address.");
      email.closest(".input-block").addClass(".error");
      valid = false;
    }

    if (password.val().trim() === "") {
      password
        .closest(".input-block")
        .next(".error-message")
        .text("Password is required.");
      password.closest(".input-block").addClass(".error");

      valid = false;
    }

    if (valid) {
      // Check if the email already exists
      var users = JSON.parse(localStorage.getItem("Penny-Users")) || [];
      var existingUser = users.find((user) => user.email === email.val());
      if (existingUser) {
        email
          .closest(".input-block")
          .next(".error-message")
          .text("Email already exists. Please use a different email.");
        valid = false;
      } else {
        var newUser = {
          name: name.val(),
          email: email.val(),
          password: password.val(),
          id: Math.floor(10 + Math.random() * 90),
          profile:"../media/skater_1881011.png",
          accounts:[],
          transactions:[],
          budget:{}
        };

        // Save user data to local storage
        users.push(newUser);
        localStorage.setItem("Penny-Users", JSON.stringify(users));

        notify("Signup successful! Please login.");

        // Toggle to the login tab
        $(".form-wrapper").removeClass("is-active");
        $(".switcher-login").parent().addClass("is-active");
      }
    }
  });

  // Login form submission 
  $(".form-login").submit(function (e) {
    e.preventDefault();
    const email = $("#login-email");
    const password = $("#login-password");
    var valid = true;

    // Clear previous error messages
    $(".error-message").text("");
    $(".input-block").removeClass(".error");

    // Validation logic for login form
    if (!validateEmail(email.val())) {
      email
        .closest(".input-block")
        .next(".error-message")
        .text("Invalid email address.");
        email.closest(".input-block").addClass(".error");
      valid = false;
    }

    if (password.val().trim() === "") {
      password
        .closest(".input-block")
        .next(".error-message")
        .text("Password is required.");
        password.closest(".input-block").addClass(".error");
      valid = false;
    }

    if (valid) {
      
      var users = JSON.parse(localStorage.getItem("Penny-Users")) || [];
      var loggedInUser = users.find(
        (user) => user.email === email.val() && user.password === password.val()
      );

      if (loggedInUser) {
        notify("Login successful!");

        
        localStorage.setItem("loggedInUser", JSON.stringify(loggedInUser));

        setTimeout(() => {
         
          window.location.href = "Home.html";
        }, 1000);
      } else {
       
        notify("Invalid email or password. Please try again.", "error");
      }
    }
  });

  function validateEmail(email) {
    var pattern = /^[^ ]+@[^ ]+\.[a-z]{2,3}$/;
    return pattern.test(email);
  }
});
