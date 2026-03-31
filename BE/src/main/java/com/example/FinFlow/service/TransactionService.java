package com.example.FinFlow.service;

import com.example.FinFlow.model.Account;
import com.example.FinFlow.model.Transaction;
import com.example.FinFlow.model.TransactionType;
import com.example.FinFlow.repository.AccountRepository;
import com.example.FinFlow.repository.TransactionRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class TransactionService {

    @Autowired
    private TransactionRepository transactionRepository;

    @Autowired
    private AccountRepository accountRepository;

    public List<Transaction> getRecentTransactionsByUser(Long userId, int limit) {
        return transactionRepository.findRecentByUserId(userId).stream()
                .limit(limit)
                .collect(Collectors.toList());
    }

    public List<Transaction> getRecentTransactionsByAccount(Long accountId, int limit) {
        return transactionRepository.findByAccount_AccountId(accountId).stream()
                .sorted((t1, t2) -> t2.getTransactionDate().compareTo(t1.getTransactionDate()))
                .limit(limit)
                .collect(Collectors.toList());
    }

    public List<Transaction> getAllTransactionsByUserId(Long userId) {
        return transactionRepository.findRecentByUserId(userId);
    }

    @Transactional
    public Transaction createTransaction(Transaction transaction) {
        // Find account
        Account account = accountRepository.findById(transaction.getAccount().getAccountId())
                .orElseThrow(() -> new RuntimeException("Account not found"));

        // Update balance
        BigDecimal currentBalance = account.getBalance() != null ? account.getBalance() : BigDecimal.ZERO;
        if (transaction.getType() == TransactionType.INCOME) {
            account.setBalance(currentBalance.add(transaction.getAmount()));
        } else {
            account.setBalance(currentBalance.subtract(transaction.getAmount()));
        }

        if (transaction.getTransactionDate() == null) {
            transaction.setTransactionDate(LocalDateTime.now());
        }
        
        accountRepository.save(account);
        return transactionRepository.save(transaction);
    }

    @Transactional
    public Transaction updateTransaction(Long id, Transaction newDetails) {
        Transaction oldTrx = transactionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Transaction not found"));
        Account account = oldTrx.getAccount();

        // 1. Revert old transaction effect on balance
        BigDecimal balance = account.getBalance();
        if (oldTrx.getType() == TransactionType.INCOME) {
            balance = balance.subtract(oldTrx.getAmount());
        } else {
            balance = balance.add(oldTrx.getAmount());
        }

        // 2. Apply new transaction effect
        if (newDetails.getType() == TransactionType.INCOME) {
            balance = balance.add(newDetails.getAmount());
        } else {
            balance = balance.subtract(newDetails.getAmount());
        }

        account.setBalance(balance);
        accountRepository.save(account);

        // 3. Update transaction details
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
        Account account = trx.getAccount();

        // Revert balance
        BigDecimal balance = account.getBalance();
        if (trx.getType() == TransactionType.INCOME) {
            account.setBalance(balance.subtract(trx.getAmount()));
        } else {
            account.setBalance(balance.add(trx.getAmount()));
        }

        accountRepository.save(account);
        transactionRepository.delete(trx);
    }
}
