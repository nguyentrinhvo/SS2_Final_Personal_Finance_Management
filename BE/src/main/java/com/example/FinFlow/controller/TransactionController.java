package com.example.FinFlow.controller;

import com.example.FinFlow.model.Transaction;
import com.example.FinFlow.service.TransactionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/transactions")
@CrossOrigin(origins = "*")
public class TransactionController {

    @Autowired
    private TransactionService transactionService;

    @GetMapping("/user/{userId}/recent")
    public ResponseEntity<List<Transaction>> getRecentTransactions(@PathVariable Long userId, @RequestParam(defaultValue = "10") int limit) {
        List<Transaction> transactions = transactionService.getRecentTransactionsByUser(userId, limit);
        return ResponseEntity.ok(transactions);
    }
    
    @GetMapping("/account/{accountId}/recent")
    public ResponseEntity<List<Transaction>> getRecentTransactionsByAccount(@PathVariable Long accountId, @RequestParam(defaultValue = "10") int limit) {
        List<Transaction> transactions = transactionService.getRecentTransactionsByAccount(accountId, limit);
        return ResponseEntity.ok(transactions);
    }
}
