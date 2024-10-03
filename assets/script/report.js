$(document).ready(function () {
  const loggedInUserId = JSON.parse(localStorage.getItem("loggedInUser"));
  let users = JSON.parse(localStorage.getItem("Penny-Users")) || [];
  const user = users.find((user) => user.id == loggedInUserId.id);

  let incomeTrendChart;
  let expenseTrendChart;
  let budgetAnalysisChart;
  let cashFlowChart;

  // Helper function to safely destroy a chart
  function safeDestroyChart(chart) {
    if (chart && chart.destroy) {
      chart.destroy();
    }
  }

  function applyFilters() {
    const startDate = new Date($("#start-date").val());
    const endDate = new Date($("#end-date").val());
    const selectedAccount = $("#account").val();

    const filteredTransactions = user.transactions.filter((transaction) => {
      const transactionDate = new Date(transaction.date);
    

      const withinDateRange =
        (isNaN(startDate) || transactionDate >= startDate) &&
        (isNaN(endDate) || transactionDate <= endDate);

      const matchesAccount =
        selectedAccount === "all" ||
        transaction.accountNumber === selectedAccount;

      return withinDateRange && matchesAccount;
    });
    

    // Safely destroy all existing charts before updating
    safeDestroyChart(incomeTrendChart);
    safeDestroyChart(expenseTrendChart);
    safeDestroyChart(budgetAnalysisChart);
    safeDestroyChart(cashFlowChart);

    updateDashboardOverview(filteredTransactions);
    updateCharts(filteredTransactions);
  }
  function updateDashboardOverview(transactions) {
    let totalIncome = 0;
    let totalExpenses = 0;
    let totalSavings = 0;

    transactions.forEach((transaction) => {
      if (transaction.type === "income") {
        totalIncome += transaction.amount;
      } else if (transaction.type === "expense") {
        totalExpenses += transaction.amount;
      }
    });

    totalSavings = totalIncome - totalExpenses;

    $("#total-income").text(`Total Income: $${totalIncome.toFixed(2)}`);
    $("#total-expenses").text(`Total Expenses: $${totalExpenses.toFixed(2)}`);
    $("#total-savings").text(`Total Savings: $${totalSavings.toFixed(2)}`);
  }

  function updateCharts(transactions) {
    const incomeData = transactions
      .filter((t) => t.type === "income")
      .map((t) => t.amount);
    const expenseData = transactions
      .filter((t) => t.type === "expense")
      .map((t) => t.amount);

    updateIncomeTrendChart(incomeData);
    updateExpenseTrendChart(expenseData);
    updateBudgetAnalysisChart(transactions);
    updateCashFlowChart(incomeData, expenseData);
  }

  function updateIncomeTrendChart(data) {
    const ctx = document.getElementById("income-trend-chart").getContext("2d");
    const container = $(ctx.canvas).parent();
    // Safely destroy the existing chart
    safeDestroyChart(incomeTrendChart);

    // Clear the canvas
    // ctx.canvas.width = ctx.canvas.width;

    if (data.length === 0) {
      $(ctx.canvas).hide();
      container.find(".no-data-message").show();
    } else {
      $(ctx.canvas).show();
      container.find(".no-data-message").hide();

      incomeTrendChart = new Chart(ctx, {
        type: "line",
        data: {
          labels: data.map((_, i) => `Day ${i + 1}`),
          datasets: [
            {
              label: "Income",
              data: data,
              borderColor: "rgb(1, 187, 199)",
              fill: false,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
        },
      });
    }
  }

  function updateExpenseTrendChart(data) {
    const ctx = document.getElementById("expense-trend-chart").getContext("2d");
    const container = $(ctx.canvas).parent();
    safeDestroyChart(expenseTrendChart);

    // Clear the canvas
    ctx.canvas.width = ctx.canvas.width;
    if (data.length === 0) {
      $(ctx.canvas).hide();
      container.find(".no-data-message").show();
    } else {
      $(ctx.canvas).show();
      container.find(".no-data-message").hide();

      expenseTrendChart = new Chart(ctx, {
        type: "line",
        data: {
          labels: data.map((_, i) => `Day ${i + 1}`),
          datasets: [
            {
              label: "Expenses",
              data: data,
              borderColor: "rgb(255,149,158)",
              fill: false,
            },
          ],
        },
      });
    }
  }

  function updateBudgetAnalysisChart(transactions) {
    const budget = user.budget || {};
    const ctx = document
      .getElementById("budget-analysis-chart")
      .getContext("2d");
    const container = $(ctx.canvas).parent();

    safeDestroyChart(budgetAnalysisChart);

    // Clear the canvas
    ctx.canvas.width = ctx.canvas.width;
    if (Object.keys(budget).length === 0) {
      $(ctx.canvas).hide();
      container.find(".no-data-message").show();
      return;
    }

    $(ctx.canvas).show();
    container.find(".no-data-message").hide();

    const categories = Object.keys(budget);
    const budgetAmounts = categories.map((category) => budget[category]);
    const spentAmounts = categories.map((category) => {
      const expenses = transactions.filter(
        (t) => t.category === category && t.type === "expense"
      );
      return expenses.reduce((total, expense) => total + expense.amount, 0);
    });

    if (budgetAnalysisChart) {
      budgetAnalysisChart.destroy();
    }

    budgetAnalysisChart = new Chart(ctx, {
      type: "bar",
      data: {
        labels: categories,
        datasets: [
          {
            label: "Budget",
            data: budgetAmounts,
            backgroundColor: "rgb(1, 187, 199)",
          },
          {
            label: "Spent",
            data: spentAmounts,
            backgroundColor: "rgb(255,149,158)",
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

  function updateCashFlowChart(incomeData, expenseData) {
    const cashFlowData = incomeData.map(
      (income, index) => income - (expenseData[index] || 0)
    );
    const ctx = document.getElementById("cash-flow-chart").getContext("2d");
    const container = $(ctx.canvas).parent();

    safeDestroyChart(cashFlowChart);

    // Clear the canvas
    ctx.canvas.width = ctx.canvas.width;

    if (cashFlowData.length === 0) {
      $(ctx.canvas).hide();
      container.find(".no-data-message").show();
    } else {
      $(ctx.canvas).show();
      container.find(".no-data-message").hide();

      cashFlowChart = new Chart(ctx, {
        type: "line",
        data: {
          labels: cashFlowData.map((_, i) => `Day ${i + 1}`),
          datasets: [
            {
              label: "Cash Flow",
              data: cashFlowData,
              borderColor: "rgb(1, 187, 199)",
              fill: false,
            },
          ],
        },
      });
    }
  }

  async function downloadPDF() {
    try {
      const { jsPDF } = window.jspdf;
      if (!jsPDF) {
        throw new Error(
          "jsPDF is not defined. Make sure the library is properly loaded."
        );
      }

      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.width;
      const pageHeight = doc.internal.pageSize.height;
      let yOffset = 20;

      // Add a title
      doc.setFontSize(18);
      doc.text("Expense Tracker Report", pageWidth / 2, yOffset, {
        align: "center",
      });
      yOffset += 15;

      // Add dashboard overview
      doc.setFontSize(14);
      doc.text("Dashboard Overview", 14, yOffset);
      yOffset += 10;
      doc.setFontSize(12);
      doc.text($("#total-income").text(), 14, yOffset);
      yOffset += 7;
      doc.text($("#total-expenses").text(), 14, yOffset);
      yOffset += 7;
      doc.text($("#total-savings").text(), 14, yOffset);
      yOffset += 15;

      // Add transactions table
      doc.setFontSize(14);
      doc.text("Transactions", 14, yOffset);
      yOffset += 10;

      const transactionsData = user.transactions.map((t) => [
        t.date,
        t.type,
        t.category,
        t.account,
        `$${t.amount.toFixed(2)}`,
      ]);

      doc.autoTable({
        startY: yOffset,
        head: [["Date", "Type", "Category", "Account", "Amount"]],
        body: transactionsData,
        margin: { top: yOffset },
      });

      yOffset = doc.lastAutoTable.finalY + 15;

      // Add budget summary
      if (yOffset + 60 > pageHeight) {
        doc.addPage();
        yOffset = 20;
      }

      doc.setFontSize(14);
      doc.text("Budget Summary", 14, yOffset);
      yOffset += 10;

      const budget = JSON.parse(localStorage.getItem("budget")) || {};
      const budgetData = Object.entries(budget).map(([category, amount]) => {
        const expenses = user.transactions.filter(
          (t) => t.category === category && t.type === "expense"
        );
        const spent = expenses.reduce(
          (total, expense) => total + expense.amount,
          0
        );
        return [
          category,
          `$${amount.toFixed(2)}`,
          `$${spent.toFixed(2)}`,
          `$${(amount - spent).toFixed(2)}`,
        ];
      });

      doc.autoTable({
        startY: yOffset,
        head: [["Category", "Budget", "Spent", "Remaining"]],
        body: budgetData,
        margin: { top: yOffset },
      });

      yOffset = doc.lastAutoTable.finalY + 15;

      // Add graphs
      async function addGraphToPDF(chartId, title) {
        if (yOffset + 120 > pageHeight) {
          doc.addPage();
          yOffset = 20;
        }

        doc.setFontSize(14);
        doc.text(title, 14, yOffset);
        yOffset += 10;

        const canvas = document.getElementById(chartId);
        const imgData = canvas.toDataURL("image/png");
        doc.addImage(imgData, "PNG", 14, yOffset, 180, 100);
        yOffset += 110;
      }

      await addGraphToPDF("income-trend-chart", "Income Trend");
      await addGraphToPDF("expense-trend-chart", "Expense Trend");
      await addGraphToPDF("budget-analysis-chart", "Budget Analysis");
      await addGraphToPDF("cash-flow-chart", "Cash Flow");

      // Save the PDF
      doc.save("expense_tracker_report.pdf");
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert(
        "There was an error generating the PDF. Please check the console for details."
      );
    }
  }

  function downloadCSV() {
    const csvContent = [];
    const headers = ["Date", "Type", "Category", "Account", "Amount"];
    csvContent.push(headers.join(","));

    user.transactions.forEach((transaction) => {
      const row = [
        transaction.date,
        transaction.type,
        transaction.category,
        transaction.account,
        transaction.amount.toFixed(2),
      ];
      csvContent.push(row.join(","));
    });

    // Add a blank row and budget summary
    csvContent.push("");
    csvContent.push("Budget Summary");
    csvContent.push("Category,Budget,Spent,Remaining");

    const budget = user.budget;
    Object.entries(budget).forEach(([category, amount]) => {
      const expenses = user.transactions.filter(
        (t) => t.category === category && t.type === "expense"
      );
      const spent = expenses.reduce(
        (total, expense) => total + expense.amount,
        0
      );
      const remaining = amount - spent;
      csvContent.push(
        `${category},${amount.toFixed(2)},${spent.toFixed(
          2
        )},${remaining.toFixed(2)}`
      );
    });

    const blob = new Blob([csvContent.join("\n")], {
      type: "text/csv;charset=utf-8;",
    });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "expense_tracker_report.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  function populateAccount() {
    // Populate accounts dropdown
    const accountSelect = $("#account");
    accountSelect.empty().append(new Option("All Accounts", "all"));

    user.accounts.forEach((account) => {
      const maskedAccountNumber = `xxxxx${account.accountNumber.slice(-3)}`;
      const option = `<option value="${account.accountNumber}">${account.bankName} - ${maskedAccountNumber}</option>`;
      accountSelect.append(option);
    });
  }

  // Safely destroy all existing charts before updating
  safeDestroyChart(incomeTrendChart);
  safeDestroyChart(expenseTrendChart);
  safeDestroyChart(budgetAnalysisChart);
  safeDestroyChart(cashFlowChart);

  $("#apply-filters").on("click", applyFilters);
  $("#download-csv").on("click", downloadCSV);
  $("#download-pdf").on("click", downloadPDF);

  populateAccount();
  applyFilters();
});
