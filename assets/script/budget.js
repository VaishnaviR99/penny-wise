$(document).ready(function() {
    const loggedInUserId = JSON.parse(localStorage.getItem("loggedInUser"));
    let users = JSON.parse(localStorage.getItem("Penny-Users")) || [];
    const user = users.find(user => user.id == loggedInUserId.id);
    let incomeExpenseChart;
    let budgetProgressChart;
    let expenseChart; 

    function updateIncomeExpenseChart(totalIncome, totalExpenses) {
        const ctx = document.getElementById('income-expense-chart').getContext('2d');
        
        if (incomeExpenseChart) {
            incomeExpenseChart.destroy();
        }
        if (!totalExpenses && !totalIncome) {
            $("#income-expense-chart-conatiner .no-data-message").show();
            return;
        } else {
            $("#income-expense-chart-conatiner .no-data-message").hide();
        }
        
        incomeExpenseChart = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: ['Income', 'Expenses'],
                datasets: [{
                    data: [totalIncome, totalExpenses],
                    backgroundColor: ['rgb(1, 187, 199)', 'rgb(255,149,158)'],
                }],
            },
        });
    }

    function updateExpenseChart(account) {
        const ctx = document.getElementById('expense-chart').getContext('2d');
        const expensesByCategory = {};

        user.transactions.forEach(transaction => {
            if (transaction.type === 'expense' && (account === 'all' || transaction.accountNumber === account)) {
                if (!expensesByCategory[transaction.category]) {
                    expensesByCategory[transaction.category] = 0;
                }
                expensesByCategory[transaction.category] += transaction.amount;
            }
        });

        const categories = Object.keys(expensesByCategory);
        const expenseAmounts = categories.map(category => expensesByCategory[category]);

        
        if (expenseChart) {
            expenseChart.destroy();
        } if (categories.length === 0) {
            $("#expense-charts .no-data-message").show();
            $("#expense-chart").hide()
            return;
        } else {
            $("#expense-charts .no-data-message").hide();
            $("#expense-chart").show()
        }

       
        expenseChart = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: categories,
                datasets: [{
                    data: expenseAmounts,
                    backgroundColor: [
                        'rgb(179, 225, 232)',
                        'rgb(193, 232, 221)',
                        'rgb(247, 247, 209)',
                        'rgb(239, 212, 221)',
                        'rgb(222, 217, 240)',
                        'rgb(228, 220, 235)',
                        'rgb(208, 232, 225)',
                    ],
                }],
            },
        });
    }

    function updateBudgetProgressChart(budget) {
       
      
        const categories = Object.keys(budget);
        const budgetAmounts = categories.map(category => budget[category]);
        const spentAmounts = categories.map(category => {
            const expenses = user.transactions.filter(transaction => transaction.category === category && transaction.type === "expense");
            return expenses.reduce((total, expense) => total + expense.amount, 0);
        });
    
        
            if (budgetProgressChart) {
                budgetProgressChart.destroy();
            }
            $(".nodata-message").hide();
            $("#budget-charts").html("")
            $("#budget-charts").append(' <canvas id="budget-progress-chart"></canvas>');
            const ctx = document.getElementById('budget-progress-chart').getContext('2d');
        
       
        budgetProgressChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: categories,
                datasets: [
                    {
                        label: 'Budget',
                        data: budgetAmounts,
                        backgroundColor: 'rgb(1, 187, 199)',
                        fill: false,
                        tension: 0.4, 
                    },
                    {
                        label: 'Spent',
                        data: spentAmounts,
                        backgroundColor: 'rgb(255,149,158)',
                        fill: false,
                        tension: 0.4, 
                    },
                ],
            },
            options: {
                scales: {
                    y: {
                        beginAtZero: true,
                    },
                },
            },
        });
    
    }

    function updateSummary(account) {
        let totalIncome = 0;
        let totalExpenses = 0;
        let totalBalance = 0;

        if (account === "all") {
            user.accounts.forEach(acc => {
                totalBalance += Number(acc.accountBalance) || 0;
            });

            user.transactions.forEach(transaction => {
                if (transaction.type === "income") {
                    totalIncome += transaction.amount;
                } else {
                    totalExpenses += transaction.amount;
                }
            });
        } else {
            const selectedAccount = user.accounts.find(acc => acc.accountNumber === account);
            if (selectedAccount) {
                totalBalance = Number(selectedAccount.accountBalance) || 0;
            } else {
                console.error(`Account not found: ${account}`);
                totalBalance = 0;
            }

            user.transactions.forEach(transaction => {
                if (transaction.accountNumber === account) {
                    if (transaction.type === "income") {
                        totalIncome += transaction.amount;
                    } else {
                        totalExpenses += transaction.amount;
                    }
                }
            });
        }

        $("#total-Balance").text(`$${(totalBalance || 0).toFixed(2)}`);
        $("#total-income").text(`$${totalIncome.toFixed(2)}`);
        $("#total-expenses").text(`$${totalExpenses.toFixed(2)}`);
        updateIncomeExpenseChart(totalIncome, totalExpenses);
        updateExpenseChart(account); 
    }

    function loadAccounts() {
        const accountSelect = $("#account-select");
        user.accounts.forEach(account => {
            const maskedAccountNumber = `xxxxx${account.accountNumber.slice(-3)}`;
            const option = `<option value="${account.accountNumber}">${account.bankName} - ${maskedAccountNumber}</option>`;
            accountSelect.append(option);
        });
    }

    function loadBudgetCategories() {
        const budget = user.budget || {};
        const categoryList = $("#category-list");
        categoryList.empty();
    
        if (Object.keys(budget).length === 0) {
            categoryList.append("<li>No Budget Available</li>");
        } else {
            for (const category in budget) {
                const categoryTotal = budget[category];
                const expenses = user.transactions.filter(transaction => transaction.category === category && transaction.type === "expense");
                const spentAmount = expenses.reduce((total, expense) => total + expense.amount, 0);
                const progress = ((spentAmount / categoryTotal) * 100).toFixed(2);
                const progressStyle = progress > 100 ? 'over-budget' : '';
    
                const progressBar = `
                    <div class="progress">
                        <p class="category-title">${category}</p>
                        <div class="spent-budget">
                           <p> Budget: $${categoryTotal}</p>
                           <p>Spent: $${spentAmount.toFixed(2)}</p>
                        </div>
                        <div class="progress-bar">
                            <div class="progress-bar-fill ${progressStyle}" style="width: ${Math.min(progress, 100)}%;">${progress}%</div>
                        </div>
                    </div>
                `;
                categoryList.append(progressBar);
            }
            updateBudgetProgressChart(budget);
        }
    }
    

    $("#account-select").on("change", function() {
        const selectedAccount = $(this).val();
        updateSummary(selectedAccount);
        loadBudgetCategories();
    });

    $("#add-budget").on("click", function() {
        $("#budget-modal").show();
    });

    $(".close-btn").on("click", function() {
        $("#budget-modal").hide();
    });

    $(window).on("click", function(event) {
        if ($(event.target).is("#budget-modal")) {
            $("#budget-modal").hide();
        }
    });

    $("#budget-category-form").on("submit", function(event) {
        event.preventDefault();
        const category = $("#budget-category").val();
        const amount = parseFloat($("#budget-amount").val());
        if (!category ||!amount) {
      
            return;
          }
        user.budget = user.budget || {};
        user.budget[category] = amount;

        // Update the user in the users array
        const userIndex = users.findIndex(u => u.id === loggedInUserId.id);
        if (userIndex > -1) {
            users[userIndex] = user;
        }

        localStorage.setItem("Penny-Users", JSON.stringify(users));

        $("#budget-category-form")[0].reset();
        $("#budget-modal").hide();
        loadBudgetCategories();

        // Show success notification
        showNotification(`Budget for ${category} added successfully!`, 'success');
    });

    // Initial load
    loadAccounts();
    updateSummary("all");
    loadBudgetCategories();
});


function showNotification(message, type = 'error') {
    const notification = $('<div class="notification"></div>');

    
    notification.text(message);

    if (type === 'success') {
        notification.css('background-color', '#4CAF50'); 
    } else if (type === 'warning') {
        notification.css('background-color', '#ff9800'); 
    } else {
        notification.css('background-color', '#f44336'); 
    }

   
    $('body').append(notification);

   
    notification.css('display', 'block').css('animation', 'slideDown 0.5s forwards');

   
    setTimeout(() => {
        notification.css('animation', 'slideUp 0.5s forwards');
        setTimeout(() => {
            notification.remove(); 
        }, 500); 
    }, 3000); 
}
