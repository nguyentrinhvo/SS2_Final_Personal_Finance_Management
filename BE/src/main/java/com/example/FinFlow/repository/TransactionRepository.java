package com.example.FinFlow.repository;

import com.example.FinFlow.model.Transaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.util.List;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {
    
    // Find recent transactions for a specific user directly
    List<Transaction> findByUser_UserIdOrderByTransactionDateDesc(Long userId, Pageable pageable);
    
    // Support the call in TransactionService
    List<Transaction> findByUser_UserId(Long userId);

    // Find transactions for a specific account
    List<Transaction> findByAccount_AccountId(Long accountId);


}
