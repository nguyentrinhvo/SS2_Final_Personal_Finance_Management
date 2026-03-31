package com.example.FinFlow.controller;

import com.example.FinFlow.model.Account;
import com.example.FinFlow.service.AccountService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/accounts")
@CrossOrigin(origins = "*")
public class AccountController {

    @Autowired
    private AccountService accountService;

    // View current balances / List all accounts for a user
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Account>> getAccountsByUser(@PathVariable Long userId) {
        List<Account> accounts = accountService.getAccountsByUserId(userId);
        return ResponseEntity.ok(accounts);
    }

    // View specific account
    @GetMapping("/{accountId}")
    public ResponseEntity<Account> getAccount(@PathVariable Long accountId) {
        Account account = accountService.getAccountById(accountId);
        if (account != null) {
            return ResponseEntity.ok(account);
        }
        return ResponseEntity.notFound().build();
    }

    // Create a new account with an initial balance
    @PostMapping("/user/{userId}")
    public ResponseEntity<Account> createAccount(
            @PathVariable Long userId,
            @RequestBody Account account) {
        Account createdAccount = accountService.createAccount(userId, account);
        if (createdAccount != null) {
            return ResponseEntity.ok(createdAccount);
        }
        return ResponseEntity.badRequest().build();
    }

    @PutMapping("/{accountId}")
    public ResponseEntity<Account> updateAccount(
            @PathVariable Long accountId,
            @RequestBody Account account) {
        Account updatedAccount = accountService.updateAccount(accountId, account);
        if (updatedAccount != null) {
            return ResponseEntity.ok(updatedAccount);
        }
        return ResponseEntity.notFound().build();
    }

    // Track and update account balance automatically (e.g. from transactions or manually)
    @PatchMapping("/{accountId}/balance")
    public ResponseEntity<Account> updateBalance(
            @PathVariable Long accountId,
            @RequestBody Map<String, BigDecimal> updates) {
        if (!updates.containsKey("balance")) {
            return ResponseEntity.badRequest().build();
        }
        BigDecimal newBalance = updates.get("balance");
        Account updatedAccount = accountService.updateAccountBalance(accountId, newBalance);
        if (updatedAccount != null) {
            return ResponseEntity.ok(updatedAccount);
        }
        return ResponseEntity.notFound().build();
    }

    @DeleteMapping("/{accountId}")
    public ResponseEntity<Void> deleteAccount(@PathVariable Long accountId) {
        accountService.deleteAccount(accountId);
        return ResponseEntity.ok().build();
    }
}
