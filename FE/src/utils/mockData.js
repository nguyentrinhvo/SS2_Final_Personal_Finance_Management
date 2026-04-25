export const MOCK_DATA = {
  categories: [
    { categoryId: 1, name: 'Food & Drinks', type: 'EXPENSE', icon: 'restaurant' },
    { categoryId: 2, name: 'Shopping', type: 'EXPENSE', icon: 'shopping_bag' },
    { categoryId: 3, name: 'Transportation', type: 'EXPENSE', icon: 'directions_car' },
    { categoryId: 4, name: 'Housing', type: 'EXPENSE', icon: 'home' },
    { categoryId: 5, name: 'Entertainment', type: 'EXPENSE', icon: 'movie' },
    { categoryId: 6, name: 'Utilities', type: 'EXPENSE', icon: 'bolt' },
    { categoryId: 7, name: 'Salary', type: 'INCOME', icon: 'payments' },
    { categoryId: 8, name: 'Investments', type: 'INCOME', icon: 'trending_up' },
    { categoryId: 9, name: 'Bonus', type: 'INCOME', icon: 'redeem' },
  ],
  accounts: [
    { accountId: 1, accountName: 'Main Bank Account', accountType: 'BANK', balance: 45280000, imageUrl: null },
    { accountId: 2, accountName: 'Cash Wallet', accountType: 'CASH', balance: 2500000, imageUrl: null },
    { accountId: 3, accountName: 'Digital Wallet', accountType: 'E-WALLET', balance: 12450000, imageUrl: null },
  ],
  transactions: Array.from({ length: 20 }).map((_, i) => ({
    transactionId: i + 1,
    amount: Math.floor(Math.random() * 2000000) + 50000,
    type: i % 3 === 0 ? 'INCOME' : 'EXPENSE',
    transactionDate: new Date(Date.now() - i * 86400000).toISOString(),
    description: `Sample Transaction ${i + 1}`,
    category: { name: ['Food & Drinks', 'Salary', 'Transportation', 'Shopping', 'Entertainment'][i % 5] },
    account: { accountName: 'Main Bank Account' }
  })),
  goals: [
    { goalId: 1, name: 'Buy New Laptop', targetAmount: 25000000, currentAmount: 15000000, deadline: '2024-12-31', imageUrl: null },
    { goalId: 2, name: 'Summer Vacation', targetAmount: 10000000, currentAmount: 2000000, deadline: '2024-07-15', imageUrl: null },
  ],
  budgets: [
    { budgetId: 1, category: { name: 'Food & Dining' }, amount: 5000000, spent: 3200000 },
    { budgetId: 2, category: { name: 'Transport' }, amount: 2000000, spent: 1800000 },
  ]
};
