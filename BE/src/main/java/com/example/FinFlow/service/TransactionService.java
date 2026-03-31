package com.example.FinFlow.service;

import com.example.FinFlow.model.Transaction;
import com.example.FinFlow.repository.TransactionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class TransactionService {

    @Autowired
    private TransactionRepository transactionRepository;

    public List<Transaction> getRecentTransactionsByUser(Long userId, int limit) {
        List<Transaction> transactions = transactionRepository.findRecentByUserId(userId);
        return transactions.stream().limit(limit).collect(Collectors.toList());
    }

    public List<Transaction> getRecentTransactionsByAccount(Long accountId, int limit) {
        // Assume findByAccount... also returns sorted? better to use custom query if not.
        return transactionRepository.findByAccount_AccountId(accountId).stream()
                .sorted((t1, t2) -> t2.getTransactionDate().compareTo(t1.getTransactionDate()))
                .limit(limit)
                .collect(Collectors.toList());
    }
}
