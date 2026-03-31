package com.example.FinFlow.repository;

import com.example.FinFlow.model.Budget;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BudgetRepository extends JpaRepository<Budget, Long> {
    List<Budget> findByUser_UserIdAndMonthAndYear(Long userId, int month, int year);
}
