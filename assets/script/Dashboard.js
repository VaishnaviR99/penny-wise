$(document).ready(function () {
    const loggedInUserId = JSON.parse(localStorage.getItem("loggedInUser"));
    let users = JSON.parse(localStorage.getItem("Penny-Users")) || [];
    const user = users.find(user => user.id == loggedInUserId.id);
    let chartInstance = null; 

    if (user) {
        $("#username").text(user.name);
    }

    function updateDashboard() {
        if (!user) {
            $("#total-balance").text(`$0.00`);
            $("#account-balances").html("<p>No user found</p>");
            $("#transaction-list").html("<li>No transactions available</li>");
            $("#graph-section").html(`<div class="empty-graph">
            <i class="fa-solid fa-chart-line"></i>
            <p >
              Income vs Expense chart will be shown here
            </p>
          </div>`);
            return;
        }

        if (!user.accounts || user.accounts.length === 0) {
            $("#total-balance").text(`$0.00`);
            $("#account-balances").html("<p>No bank accounts available</p>");
            $("#transaction-list").html("<li>No transactions available</li>");
            $("#graph-section").html(`<div class="empty-graph">
            <i class="fa-solid fa-chart-line"></i>
            <p ">
              Income vs Expense chart will be shown here
            </p>
          </div>`);
            return;
        }

        // Calculate total balance
        let totalBalance = user.accounts.reduce((acc, account) => acc + parseFloat(account.accountBalance), 0);
        $("#total-balance").text(`$${totalBalance.toFixed(2)}`);

        let accountBalances = user.accounts.map(account => {
            let accountBalance = parseFloat(account.accountBalance);
            return `<p>${account.bankName}: $${accountBalance.toFixed(2)}</p>`;
        }).join("");
        $("#account-balances").html(accountBalances);

        // Update recent transactions (Top 5, latest first)
        if (!user.transactions || user.transactions.length === 0) {
            $("#transaction-list").html('<li>No transactions available</li>');
        } else {
            let recentTransactions = user.transactions
                .sort((a, b) => new Date(b.date) - new Date(a.date))
                .slice(0, 5) 
                .map(transaction => {
                    let amountClass = transaction.type === "income" ? "transaction-amount income" : "transaction-amount expense";
                    const arrowIcon = transaction.type === "income" ? 'fa-arrow-up' : 'fa-arrow-down';
                    return `
                    <div class="latest ${transaction.type}" data-aos="fade-up">
                        <div>
                            <p class="tranxn-title">${transaction.title}</p>
                            <p class="${amountClass}">${transaction.type === "income" ? "+" : "-"}$${parseFloat(transaction.amount).toFixed(2)}&nbsp;<i class="fa ${arrowIcon}"></i></p></div>
                           <p class="date">${transaction.date}</p>
                        
                    </div>`;
                }).join("");
            $("#transaction-list").html(recentTransactions);
        }

        let { labels, incomeData, expenseData } = prepareMonthlyData(user.transactions);

        if (incomeData.every(val => val === 0) && expenseData.every(val => val === 0)) {
            $("#graph-section .no-data-message").show();
        } else {
            if (chartInstance) {
                chartInstance.destroy();
            }
            $("#graph-section").append('<canvas id="income-expense-chart"></canvas>');
        let ctx = document.getElementById('income-expense-chart').getContext('2d');
        chartInstance = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Income',
                        data: incomeData,
                        borderColor: 'rgb(1, 187, 199)',
                        fill: false,
                        tension: 0.4, 
                    },
                    {
                        label: 'Expenses',
                        data: expenseData,
                        borderColor: 'rgb(255,149,158)',
                        fill: false,
                        tension: 0.4, 
                    }
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
    }

    function prepareMonthlyData(transactions) {
        const labels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        let incomeData = new Array(12).fill(0);
        let expenseData = new Array(12).fill(0);

        transactions.forEach(transaction => {
            let date = new Date(transaction.date);
            let monthIndex = date.getMonth(); 

            if (transaction.type === "income") {
                incomeData[monthIndex] += parseFloat(transaction.amount);
            } else if (transaction.type === "expense") {
                expenseData[monthIndex] += parseFloat(transaction.amount);
            }
        });

        return { labels, incomeData, expenseData };
    }

    updateDashboard();

 

    
});
