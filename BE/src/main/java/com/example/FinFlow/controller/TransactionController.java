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

    @GetMapping("/user/{userId}/all")
    public ResponseEntity<List<Transaction>> getAllTransactions(@PathVariable Long userId) {
        List<Transaction> transactions = transactionService.getAllTransactionsByUserId(userId);
        return ResponseEntity.ok(transactions);
    }

    @PostMapping
    public ResponseEntity<Transaction> createTransaction(@RequestBody Transaction transaction) {
        try {
            Transaction created = transactionService.createTransaction(transaction);
            return ResponseEntity.ok(created);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<Transaction> updateTransaction(@PathVariable Long id, @RequestBody Transaction details) {
        try {
            Transaction updated = transactionService.updateTransaction(id, details);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTransaction(@PathVariable Long id) {
        try {
            transactionService.deleteTransaction(id);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/user/{userId}/recent")
    public ResponseEntity<List<Transaction>> getRecentTransactions(@PathVariable Long userId, @RequestParam(defaultValue = "10") int limit) {
        List<Transaction> transactions = transactionService.getRecentTransactionsByUser(userId, limit);
        return ResponseEntity.ok(transactions);
    }
}
