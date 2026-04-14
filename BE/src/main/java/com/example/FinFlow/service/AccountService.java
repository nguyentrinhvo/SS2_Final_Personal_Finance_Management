package com.example.FinFlow.service;

import com.example.FinFlow.model.Account;
import com.example.FinFlow.model.User;
import com.example.FinFlow.repository.AccountRepository;
import com.example.FinFlow.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class AccountService {

    @Autowired
    private AccountRepository accountRepository;

    @Autowired
    private UserRepository userRepository;

    public List<Account> getAccountsByUserId(Long userId) {
        return accountRepository.findByUser_UserId(userId);
    }

    public Account createAccount(Long userId, Account accountDetails) {
        Optional<User> userOptional = userRepository.findById(userId);
        if (userOptional.isPresent()) {
            Account account = new Account();
            account.setUser(userOptional.get());
            account.setAccountName(accountDetails.getAccountName());
            account.setAccountType(accountDetails.getAccountType());
            account.setBalance(accountDetails.getBalance() != null ? accountDetails.getBalance() : BigDecimal.ZERO);
            account.setImageUrl(accountDetails.getImageUrl());
            account.setCreatedAt(LocalDateTime.now());
            return accountRepository.save(account);
        }
        return null; // Or throw an exception
    }

    public Account updateAccountBalance(Long accountId, BigDecimal newBalance) {
        Optional<Account> accountOptional = accountRepository.findById(accountId);
        if (accountOptional.isPresent()) {
            Account account = accountOptional.get();
            account.setBalance(newBalance);
            return accountRepository.save(account);
        }
        return null;
    }
    
    public Account getAccountById(Long accountId) {
        return accountRepository.findById(accountId).orElse(null);
    }

    public Account updateAccount(Long accountId, Account details) {
        Optional<Account> accountOptional = accountRepository.findById(accountId);
        if (accountOptional.isPresent()) {
            Account account = accountOptional.get();
            account.setAccountName(details.getAccountName());
            account.setAccountType(details.getAccountType());
            if (details.getBalance() != null) {
                account.setBalance(details.getBalance());
            }
            if (details.getImageUrl() != null) {
                account.setImageUrl(details.getImageUrl());
            }
            return accountRepository.save(account);
        }
        return null;
    }

    public void deleteAccount(Long accountId) {
        accountRepository.deleteById(accountId);
    }
}
