$(() => {
  AOS.init({
    duration: 800,
    easing: "ease-in-out",
  });

  const accountModal = $("#account-modal");
  const addAccountBtn = $("#add-account-btn");
  const closeBtn = $(".close-btn");
  const loggedInUserId = JSON.parse(localStorage.getItem("loggedInUser"));

  // Open modal
  addAccountBtn.on("click", () => {
    let users = JSON.parse(localStorage.getItem("Penny-Users")) || [];
    const user = users.find((user) => user.id == loggedInUserId.id);

    if (user && user.accounts && user.accounts.length >= 3) {
      showNotification("You cannot add more than 3 bank accounts.", "warning");
    } else {
      accountModal.show();
    }
  });

  // Close modal
  closeBtn.on("click", () => {
    accountModal.hide();
  });

  // Close modal on outside click
  $(window).on("click", (event) => {
    if ($(event.target).is(accountModal)) {
      accountModal.hide();
    }
  });

  $("#bank-name").change(function () {
    if ($(this).val() === "other") {
      $("#otherBankName").show();
    } else {
      $("#otherBankName").hide();
      $("#otherBankName").val("");
    }
  });

  $("#bank-account-form").on("submit", function (e) {
    e.preventDefault();

    const loggedInUserId = JSON.parse(localStorage.getItem("loggedInUser"));
    const bankName =
      $("#bank-name").val() === "other"
        ? $("#otherBankName").val()
        : $("#bank-name option:selected").text();
    const accountNumber = $("#account-number").val();
    const accountHolder = $("#account-holder").val();
    const accountBalance = $("#account-balance").val();
    let bankLogo;

    if (!accountNumber ||!accountHolder ||!accountBalance) {
      
      return;
    }
    switch ($("#bank-name").val()) {
      case "chase":
        bankLogo = "../media/chase.png";
        break;
      case "bankofamerica":
        bankLogo = "../media/bank-of-americapng.webp";
        break;
      case "wellsfargo":
        bankLogo = "../media/Wells_Fargo-logo.wine.png";
        break;
      case "citibank":
        bankLogo = "../media/citibank.png";
        break;
      case "tdbank":
        bankLogo = "../media/TD-Bank-logo.png";
        break;
      case "other":
        bankLogo = "../media/other.png";
        break;
      default:
        bankLogo = "../media/other.png";
    }

    const bankAccount = {
      id: Date.now(),
      bankName,
      accountNumber,
      accountHolder,
      accountBalance: parseFloat(accountBalance),
      bankLogo,
    };

    let users = JSON.parse(localStorage.getItem("Penny-Users")) || [];
    const user = users.find((user) => user.id == loggedInUserId.id);

    if (!user) {
      showNotification("User not found.", "error");
      return;
    } else if (user.accounts && user.accounts.length >= 3) {
      showNotification("You cannot add more than 3 bank accounts.", "warning");
      return;
    } else {user.accounts.push(bankAccount);

    localStorage.setItem("Penny-Users", JSON.stringify(users));

    $("#bank-account-form").trigger("reset");
    $("#otherBankName").hide();

    displayBankAccounts();
    accountModal.hide();

    showNotification("Bank account added successfully.", "success");
    }
  });

  function displayBankAccounts() {
    const loggedInUserId = JSON.parse(localStorage.getItem("loggedInUser"));

    let users = JSON.parse(localStorage.getItem("Penny-Users")) || [];
    const user = users.find((user) => user.id == loggedInUserId.id);
    if (user && user.accounts.length > 0) {
      $("#bank-cards").html("");
      
      user.accounts.forEach((item) => {
        if (item) {
           
          appendBankCard(item);
        }
      });
    }
  }

  function appendBankCard(bankAccount) {
    const lastThreeDigits = bankAccount.accountNumber.slice(-3);
    const maskedNumber = "XXX XXX " + lastThreeDigits;

    const bankCardHTML = `
              <div class="container" data-id="${bankAccount.id}" data-aos="flip-up">
                <span class="logo">
                  <img src="${bankAccount.bankLogo}" alt="${bankAccount.bankName}" />
                  <h5>${bankAccount.bankName}</h5>
                </span>
                <h3 id="balance">${bankAccount.accountBalance} USD</h3>
                <div class="card-details">
                  <div class="name-number">
                    <h5 class="name account-holder">${bankAccount.accountHolder}</h5>
                    <h6 class="num-label">Account Number</h6>
                    <h5 class="number account-number">${maskedNumber}</h5>
                  </div>
                </div>
               <i class="fa-solid fa-trash delete-btn"></i>
              </div>
            `;
    $("#bank-cards").append(bankCardHTML);

    // Add event listener for delete button
    $(`.container[data-id='${bankAccount.id}'] .delete-btn`).on(
      "click",
      function () {
        showNotification(
          "This will delete the bank account and all related transactions.",
          "warning"
        );
        setTimeout(() => {
          deleteBankAccount(bankAccount.id);
        }, 1500);
      }
    );
  }

  function deleteBankAccount(accountId) {
    const loggedInUserId = JSON.parse(localStorage.getItem("loggedInUser"));
    let users = JSON.parse(localStorage.getItem("Penny-Users")) || [];
    const user = users.find((user) => user.id == loggedInUserId.id);

    if (user && user.accounts) {
      const accountToDelete = user.accounts.find(
        (account) => account.id === accountId
      );

      const remainingTransactions = user.transactions.filter((transaction) => {
        if (transaction.accountNumber === accountToDelete.accountNumber) {
          if (transaction.type === "income") {
            accountToDelete.accountBalance -= transaction.amount;
          } else if (transaction.type === "expense") {
            accountToDelete.accountBalance += transaction.amount;
          }
          return false;
        }
        return true;
      });

      user.transactions = remainingTransactions;
      user.accounts = user.accounts.filter(
        (account) => account.id !== accountId
      );
      localStorage.setItem("Penny-Users", JSON.stringify(users));

      $(`.container[data-id='${accountId}']`).remove();

      showNotification("Bank account deleted successfully.", "success");

      if (user.accounts.length < 1) {
        window.location.reload();
      }
    }
  }

  displayBankAccounts();
});

function showNotification(message, type = "error") {
  const notification = $('<div class="notification"></div>');

  notification.text(message);

  if (type === "success") {
    notification.css("background-color", "#4CAF50");
  } else if (type === "warning") {
    notification.css("background-color", "#ff9800");
  } else {
    notification.css("background-color", "#f44336");
  }

  $("body").append(notification);

  notification
    .css("display", "block")
    .css("animation", "slideDown 0.5s forwards");

  setTimeout(() => {
    notification.css("animation", "slideUp 0.5s forwards");
    setTimeout(() => {
      notification.remove();
    }, 500);
  }, 3000);
}
