$(() => {
  const transactionModal = $("#transaction-modal");
  const addTransactionBtn = $("#add-transaction-btn");
  const closeBtn = $(".close-btn");
  const transactionCards = $("#transaction-cards");

  const loggedInUserId = JSON.parse(localStorage.getItem("loggedInUser"));
  let users = JSON.parse(localStorage.getItem("Penny-Users")) || [];
  const user = users.find((user) => user.id == loggedInUserId.id);

  let transactions = user.transactions || [];

  // Function to display transactions
  function displayTransactions() {
    transactionCards.empty();

    if (transactions.length === 0) {
      transactionCards.append(`<div class="empty-sack">
            <i class="fa-solid fa-sack-xmark"></i>

            <p class="noTranxn">No Transactions Found</p>
          </div>`);
    } else {
      transactions
        .slice()
        .reverse()
        .forEach((transaction) => {
          const isIncome = transaction.type === "income";
          const sign = isIncome ? "+" : "-";
          const arrowIcon = isIncome ? "fa-arrow-up" : "fa-arrow-down";

          const amount =
            transaction.amount !== null ? transaction.amount.toFixed(2) : 0.0;
          const card = `
                      <div class="transaction-card ${
                        transaction.type
                      }" data-id="${transaction.id}">
                        <div class="title-circle">
                          ${transaction.title.charAt(0).toUpperCase()}
                        </div>
                        <div class="trnxn-container">
                          <div class="transaction-detail">
                            <div class="title-category">
                              <h3>${transaction.title}</h3>
                              <p class="category-${transaction.type}">${
            transaction.category
          }</p>
                            </div>
                            <div class="amount-bank">
                              <p class="amount ${transaction.type}">
                                ${sign} $${transaction.amount.toFixed(2)}
                                 &nbsp;<i class="fa ${arrowIcon}"></i>
                              </p>
                              <p>${
                                transaction.bankName
                              } - xxxxx${transaction.accountNumber.slice(
            -3
          )}</p>
                            </div>
                          </div>
                          <p class="date">${transaction.date}</p>
                          <i class="fa-solid fa-ban remove-transaction"></i>
                        </div>
                      </div>
                    `;
          transactionCards.append(card);
        });

      // Add event listener for removing transactions
      $(".remove-transaction").on("click", function () {
        console.log("removed");
        const transactionId = $(this).closest(".transaction-card").data("id");
        const removedTransaction = transactions.find(
          (transaction) => transaction.id === transactionId
        );

        // to Update the account balance when removing a transaction
        updateAccountBalance(
          removedTransaction.accountNumber,
          removedTransaction.amount,
          removedTransaction.type === "income" ? "expense" : "income"
        );

        transactions = transactions.filter(
          (transaction) => transaction.id !== transactionId
        );
        user.transactions = transactions;
        localStorage.setItem("Penny-Users", JSON.stringify(users));

        displayTransactions();
        showNotification("Transaction deleted successfully.", "success");
      });
    }
  }

  // Open modal
  addTransactionBtn.on("click", () => {
    transactionModal.show();
  });

  // Close modal
  closeBtn.on("click", () => {
    transactionModal.hide();
  });

  // Close modal on outside click
  $(window).on("click", (event) => {
    if ($(event.target).is(transactionModal)) {
      transactionModal.hide();
    }
  });

  // Handle tab switching
  $(".tablink").on("click", function () {
    $(".tablink").removeClass("active");
    $(this).addClass("active");
    $(".tabcontent").hide();
    $(`#${$(this).data("tab")}`).show();
  });

  // Populate account select options
  function populateAccountSelectOptions() {
    if (user && user.accounts) {
      const accountOptions = user.accounts
        .map((account) => {
          const maskedAccountNumber = `xxxxx${account.accountNumber.slice(-3)}`;
          return `<option value="${account.accountNumber}-${account.bankName}">${account.bankName} - ${maskedAccountNumber}</option>`;
        })
        .join("");

      $("#expense-account").empty().append(accountOptions);
      $("#income-account").empty().append(accountOptions);
    }
  }

  // Update account balance
  function updateAccountBalance(accountNumber, amount, type) {
    const account = user.accounts.find(
      (acc) => acc.accountNumber === accountNumber
    );
    if (account) {
      if (type === "expense") {
        account.accountBalance -= amount;
      } else if (type === "income") {
        account.accountBalance += amount;
      }
      localStorage.setItem("Penny-Users", JSON.stringify(users));
    }
  }

  // Handle form submission for expenses
  $("#expense-transaction-form").on("submit", (event) => {
    event.preventDefault();
    // Validation: Check if all required fields are filled
    const title = $("#expense-title").val().trim();
    const amount = $("#expense-amount").val().trim();
    const account = $("#expense-account").val();
    const category = $("#expense-category").val();
    const date = $("#expense-date").val().trim();
    if (!title || !amount || !account || !category || !date) {
      showNotification("Please fill in all required fields.", "error");
      return;
    }

    const accountData = $("#expense-account").val().split("-");
    const accountNumber = accountData[0];
    const bankName = accountData[1];

    const newTransaction = {
      type: "expense",
      title: title,
      amount: parseFloat(amount),
      accountNumber: accountNumber,
      bankName: bankName,
      category: category,
      date: date,
      id: Date.now(),
    };

    // Check if the account has enough balance
    const selectedAccount = user.accounts.find(
      (account) => account.accountNumber === accountNumber
    );

    if (selectedAccount.accountBalance >= newTransaction.amount) {
      user.transactions.push(newTransaction);
      updateAccountBalance(
        newTransaction.accountNumber,
        newTransaction.amount,
        newTransaction.type
      );
      localStorage.setItem("Penny-Users", JSON.stringify(users));

      $("#expense-transaction-form").trigger("reset");
      transactionModal.hide();
      displayTransactions();
      showNotification("Expense transaction added successfully.", "success");
    } else {
      showNotification(
        "Insufficient balance in the selected account to complete this transaction.",
        "error"
      );
      return;
    }
  });

  // Handle form submission for incomes
  $("#income-transaction-form").on("submit", (event) => {
    event.preventDefault();

    // Validation: Check if all required fields are filled
    const title = $("#income-title").val().trim();
    const amount = $("#income-amount").val().trim();
    const account = $("#income-account").val();
    const category = $("#incomeCategory").val();
    const date = $("#income-date").val().trim();

    if (!title || !amount || !account || !category || !date) {
      showNotification("Please fill in all required fields.", "error");
      return;
    }

    const accountData = $("#income-account").val().split("-");
    const accountNumber = accountData[0];
    const bankName = accountData[1];

    const newTransaction = {
      type: "income",
      title: title,
      amount: parseFloat(amount),
      accountNumber: accountNumber,
      bankName: bankName,
      category: category,
      date: date,
      id: Date.now(),
    };

    console.log("Income Transaction:", newTransaction);

    user.transactions.push(newTransaction);
    updateAccountBalance(
      newTransaction.accountNumber,
      newTransaction.amount,
      newTransaction.type
    );
    localStorage.setItem("Penny-Users", JSON.stringify(users));

    $("#income-transaction-form").trigger("reset");
    transactionModal.hide();
    displayTransactions();
    showNotification("Income transaction added successfully.", "success");
  });

  // Initial display of transactions
  populateAccountSelectOptions();
  displayTransactions();
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
