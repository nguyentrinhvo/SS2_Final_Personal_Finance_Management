package com.example.FinFlow.controller;

import com.example.FinFlow.model.Budget;
import com.example.FinFlow.model.Category;
import com.example.FinFlow.repository.BudgetRepository;
import com.example.FinFlow.repository.CategoryRepository;
import com.example.FinFlow.repository.UserRepository;
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

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @GetMapping("/user/{userId}/current")
    public ResponseEntity<List<Budget>> getCurrentBudgets(@PathVariable Long userId) {
        LocalDate now = LocalDate.now();
        List<Budget> budgets = budgetRepository.findByUser_UserIdAndMonthAndYear(userId, now.getMonthValue(), now.getYear());
        return ResponseEntity.ok(budgets);
    }

    @PostMapping("/user/{userId}")
    public ResponseEntity<Budget> createOrUpdateBudget(@PathVariable Long userId, @RequestBody Budget budget) {
        return userRepository.findById(userId).map(user -> {
            Budget entityToSave;
            
            // If it's an update (ID present)
            if (budget.getBudgetId() != null) {
                entityToSave = budgetRepository.findById(budget.getBudgetId()).orElse(budget);
            } else {
                entityToSave = budget;
                LocalDate now = LocalDate.now();
                entityToSave.setMonth(now.getMonthValue());
                entityToSave.setYear(now.getYear());
            }

            entityToSave.setUser(user);
            entityToSave.setAmountLimit(budget.getAmountLimit());
            
            // Resolve category if provided
            if (budget.getCategory() != null && budget.getCategory().getCategoryId() != null) {
                categoryRepository.findById(budget.getCategory().getCategoryId())
                    .ifPresent(entityToSave::setCategory);
            }
            
            return ResponseEntity.ok(budgetRepository.save(entityToSave));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBudget(@PathVariable Long id) {
        budgetRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }
}
