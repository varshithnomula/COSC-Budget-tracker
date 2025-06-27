// Initialize variables to store expenses and chart
let expenses = [];
let expenseChart = null;

// DOM elements
const expenseForm = document.getElementById('expense-form');
const categoryInput = document.getElementById('category');
const amountInput = document.getElementById('amount');
const expensesList = document.getElementById('expenses-list');
const totalAmountElement = document.getElementById('total-amount');
const chartCanvas = document.getElementById('expense-chart');

// Colors for the chart (can be extended)
const chartColors = [
    '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF',
    '#FF9F40', '#8AC249', '#EA526F', '#25CCF7', '#FD7272',
    '#58B19F', '#182C61', '#6D214F', '#2C3A47', '#B33771'
];

// Initialize the application
function init() {
    // Load expenses from local storage if available
    loadExpenses();
    
    // Set up event listeners
    expenseForm.addEventListener('submit', addExpense);
    
    // Render initial data
    renderExpensesList();
    renderChart();
}

// Add a new expense
function addExpense(e) {
    e.preventDefault();
    
    const category = categoryInput.value.trim();
    const amount = parseFloat(amountInput.value);
    
    if (category === '' || isNaN(amount) || amount <= 0) {
        alert('Please enter a valid category and amount.');
        return;
    }
    
    // Create a new expense object
    const expense = {
        id: Date.now(), // Use timestamp as a unique ID
        category,
        amount
    };
    
    // Add to expenses array
    expenses.push(expense);
    
    // Save to local storage
    saveExpenses();
    
    // Clear form
    categoryInput.value = '';
    amountInput.value = '';
    categoryInput.focus();
    
    // Update UI
    renderExpensesList();
    renderChart();
}

// Delete an expense
function deleteExpense(id) {
    // Filter out the expense with the given ID
    expenses = expenses.filter(expense => expense.id !== id);
    
    // Save to local storage
    saveExpenses();
    
    // Update UI
    renderExpensesList();
    renderChart();
}

// Render the expenses list
function renderExpensesList() {
    // Clear the current list
    expensesList.innerHTML = '';
    
    // Calculate total
    const total = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    
    // Update total display
    totalAmountElement.textContent = `$${total.toFixed(2)}`;
    
    // If no expenses, show a message
    if (expenses.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = '<td colspan="3" style="text-align: center;">No expenses added yet</td>';
        expensesList.appendChild(row);
        return;
    }
    
    // Add each expense to the table
    expenses.forEach(expense => {
        const row = document.createElement('tr');
        
        row.innerHTML = `
            <td>${expense.category}</td>
            <td>$${expense.amount.toFixed(2)}</td>
            <td>
                <button class="delete-btn" data-id="${expense.id}">Delete</button>
            </td>
        `;
        
        expensesList.appendChild(row);
    });
    
    // Add event listeners to delete buttons
    document.querySelectorAll('.delete-btn').forEach(button => {
        button.addEventListener('click', () => {
            const id = parseInt(button.getAttribute('data-id'));
            deleteExpense(id);
        });
    });
}

// Render the pie chart
function renderChart() {
    // Destroy existing chart if it exists
    if (expenseChart) {
        expenseChart.destroy();
    }
    
    // If no expenses, don't render a chart
    if (expenses.length === 0) {
        return;
    }
    
    // Prepare data for the chart
    const categories = [];
    const amounts = [];
    const backgroundColors = [];
    
    // Group expenses by category
    const groupedExpenses = {};
    
    expenses.forEach(expense => {
        if (groupedExpenses[expense.category]) {
            groupedExpenses[expense.category] += expense.amount;
        } else {
            groupedExpenses[expense.category] = expense.amount;
        }
    });
    
    // Convert grouped data to arrays for the chart
    let colorIndex = 0;
    for (const category in groupedExpenses) {
        categories.push(category);
        amounts.push(groupedExpenses[category]);
        backgroundColors.push(chartColors[colorIndex % chartColors.length]);
        colorIndex++;
    }
    
    // Create the chart
    expenseChart = new Chart(chartCanvas, {
        type: 'pie',
        data: {
            labels: categories,
            datasets: [{
                data: amounts,
                backgroundColor: backgroundColors,
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'right',
                    labels: {
                        font: {
                            size: 14
                        }
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = context.raw || 0;
                            const total = context.chart.data.datasets[0].data.reduce((a, b) => a + b, 0);
                            const percentage = Math.round((value / total) * 100);
                            return `${label}: $${value.toFixed(2)} (${percentage}%)`;
                        }
                    }
                }
            }
        }
    });
}

// Save expenses to local storage
function saveExpenses() {
    localStorage.setItem('expenses', JSON.stringify(expenses));
}

// Load expenses from local storage
function loadExpenses() {
    const savedExpenses = localStorage.getItem('expenses');
    if (savedExpenses) {
        expenses = JSON.parse(savedExpenses);
    }
}

// Initialize the app when the DOM is loaded
document.addEventListener('DOMContentLoaded', init);