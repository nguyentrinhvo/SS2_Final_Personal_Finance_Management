package com.example.FinFlow.service;

import com.example.FinFlow.model.Account;
import com.example.FinFlow.model.Transaction;
import com.example.FinFlow.model.TransactionType;
import com.example.FinFlow.repository.AccountRepository;
import com.example.FinFlow.repository.TransactionRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.data.domain.PageRequest;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class TransactionService {

    @Autowired
    private TransactionRepository transactionRepository;

    @Autowired
    private AccountRepository accountRepository;

    public List<Transaction> getRecentTransactionsByUser(Long userId, int limit) {
        return transactionRepository.findByUser_UserIdOrderByTransactionDateDesc(userId, PageRequest.of(0, limit));
    }

    public List<Transaction> getRecentTransactionsByAccount(Long accountId, int limit) {
        return transactionRepository.findByAccount_AccountId(accountId).stream()
                .sorted((t1, t2) -> t2.getTransactionDate().compareTo(t1.getTransactionDate()))
                .limit(limit)
                .collect(Collectors.toList());
    }

    public List<Transaction> getAllTransactionsByUserId(Long userId) {
        return transactionRepository.findByUser_UserId(userId);
    }

    @Transactional
    public Transaction createTransaction(Transaction transaction) {
        // Find account if provided
        Account account = null;
        if (transaction.getAccount() != null && transaction.getAccount().getAccountId() != null) {
            account = accountRepository.findById(transaction.getAccount().getAccountId())
                .orElse(null);
        }

        // Update balance only if account exists
        if (account != null) {
            BigDecimal currentBalance = account.getBalance() != null ? account.getBalance() : BigDecimal.ZERO;
            if (transaction.getType() == TransactionType.INCOME) {
                account.setBalance(currentBalance.add(transaction.getAmount()));
            } else {
                account.setBalance(currentBalance.subtract(transaction.getAmount()));
            }
            accountRepository.save(account);
        }
        
        // Ensure user is set (from account if not already set)
        if (transaction.getUser() == null && account != null) {
            transaction.setUser(account.getUser());
        }
        return transactionRepository.save(transaction);
    }

    @Transactional
    public Transaction updateTransaction(Long id, Transaction newDetails) {
        Transaction oldTrx = transactionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Transaction not found"));
        // 1. Revert old transaction effect on OLD account balance
        Account oldAccount = oldTrx.getAccount();
        if (oldAccount != null) {
            BigDecimal oldBalance = oldAccount.getBalance() != null ? oldAccount.getBalance() : BigDecimal.ZERO;
            if (oldTrx.getType() == TransactionType.INCOME) {
                oldBalance = oldBalance.subtract(oldTrx.getAmount());
            } else {
                oldBalance = oldBalance.add(oldTrx.getAmount());
            }
            oldAccount.setBalance(oldBalance);
            accountRepository.save(oldAccount);
        }

        // 2. Identify NEW account and apply new transaction effect
        Account newAccount = null;
        if (newDetails.getAccount() != null && newDetails.getAccount().getAccountId() != null) {
            newAccount = accountRepository.findById(newDetails.getAccount().getAccountId()).orElse(null);
        }
        
        if (newAccount != null) {
            BigDecimal newBalance = newAccount.getBalance() != null ? newAccount.getBalance() : BigDecimal.ZERO;
            if (newDetails.getType() == TransactionType.INCOME) {
                newBalance = newBalance.add(newDetails.getAmount());
            } else {
                newBalance = newBalance.subtract(newDetails.getAmount());
            }
            newAccount.setBalance(newBalance);
            accountRepository.save(newAccount);
        }

        // 3. Update transaction details
        oldTrx.setAccount(newAccount);
        oldTrx.setAmount(newDetails.getAmount());
        oldTrx.setType(newDetails.getType());
        oldTrx.setNote(newDetails.getNote());
        oldTrx.setCategory(newDetails.getCategory());
        if (newDetails.getTransactionDate() != null) {
            oldTrx.setTransactionDate(newDetails.getTransactionDate());
        }

        return transactionRepository.save(oldTrx);
    }

    @Transactional
    public void deleteTransaction(Long id) {
        Transaction trx = transactionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Transaction not found"));
        // Revert balance if account exists
        Account account = trx.getAccount();
        if (account != null) {
            BigDecimal balance = account.getBalance();
            if (trx.getType() == TransactionType.INCOME) {
                account.setBalance(balance.subtract(trx.getAmount()));
            } else {
                account.setBalance(balance.add(trx.getAmount()));
            }
            accountRepository.save(account);
        }
        transactionRepository.delete(trx);
    }
}
