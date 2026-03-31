package com.example.FinFlow.controller;

import com.example.FinFlow.model.Budget;
import com.example.FinFlow.repository.BudgetRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/budgets")
@CrossOrigin(origins = "*")
public class BudgetController {

    @Autowired
    private BudgetRepository budgetRepository;

    @GetMapping("/user/{userId}/current")
    public ResponseEntity<List<Budget>> getCurrentBudgets(@PathVariable Long userId) {
        LocalDate now = LocalDate.now();
        List<Budget> budgets = budgetRepository.findByUser_UserIdAndMonthAndYear(userId, now.getMonthValue(), now.getYear());
        return ResponseEntity.ok(budgets);
    }
}
