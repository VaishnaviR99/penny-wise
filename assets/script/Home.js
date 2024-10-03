$(() => {
  $("#content-area").load("./Dashboard.html", function() {
   
    $.getScript("../script/Dashboard.js");
});

$(".menu-item").click(function () {
    const targetContent = $(this).data("content");
    $(this).addClass("active").siblings().removeClass("active");

    $("#content-area").empty();
    $("#content-area").load(`./${targetContent}`, function() {
        // Re-initialize the script based on the loaded content
        if (targetContent === "Dashboard.html") {
            $.getScript("../script/Dashboard.js");
        } else if (targetContent === "Transaction.html") {
            $.getScript("../script/Transactions.js");
        } else if (targetContent === "Report.html") {
            $.getScript("../script/report.js");
        } else if(targetContent === "Accounts.html"){
          $.getScript("../script/accounts.js");
        }
        else if(targetContent === "Budget.html"){
            $.getScript("../script/budget.js");
        }
       
    });
});

  const user = JSON.parse(localStorage.getItem("loggedInUser"));
  if (user) {
      $(".username").html(user.name);
      $(".useremail").html(user.email);
      $(".profile-image").attr("src", user.profile);
  } else {
      window.location.href = "Auth.html";
  }

  $(".profileIcons img").each(function () {
      if ($(this).attr("src") === user.profile) {
          $(this).addClass("selected");
      } else {
          $(this).removeClass("selected");
      }
  });

  $("#profile").on("click", function () {
      $("#user-modal").toggle();
  });

  // Log out user and clear localStorage
  $("#logout").on("click", function () {
      localStorage.removeItem("loggedInUser");
      window.location.href = "Auth.html";
  });

  // Update profile picture
  $(".profileIcons img").on("click", function () {
      const selectedImgSrc = $(this).attr("src");
      $("#profile img").attr("src", selectedImgSrc);
      $("#userDetail img").attr("src", selectedImgSrc);

      // Update user data in localStorage
      const user = JSON.parse(localStorage.getItem("loggedInUser"));
      if (user) {
          user.profile = selectedImgSrc;
          localStorage.setItem("loggedInUser", JSON.stringify(user));
       
          const userId = user.id;
          const pennyUsers = JSON.parse(localStorage.getItem("Penny-Users")) || [];
          const userIndex = pennyUsers.findIndex((user) => user.id === userId);

          if (userIndex !== -1) {
              pennyUsers[userIndex].profile = selectedImgSrc;
              localStorage.setItem("Penny-Users", JSON.stringify(pennyUsers));
          }
        
          $(".profileIcons img").each(function () {
              if ($(this).attr("src") === selectedImgSrc) {
                  $(this).addClass("selected");
              } else {
                  $(this).removeClass("selected");
              }
          });
      }
  });
});
