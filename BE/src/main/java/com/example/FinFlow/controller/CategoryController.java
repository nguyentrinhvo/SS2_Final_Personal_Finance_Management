package com.example.FinFlow.controller;

import com.example.FinFlow.model.Category;
import com.example.FinFlow.repository.CategoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/categories")
@CrossOrigin(origins = "*")
public class CategoryController {

    @Autowired
    private CategoryRepository categoryRepository;

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Category>> getCategories(@PathVariable Long userId) {
        // Return default categories (user is null) and user-specific categories
        List<Category> categories = categoryRepository.findByUser_UserIdOrUserIsNull(userId);
        return ResponseEntity.ok(categories);
    }

    @PostMapping
    public ResponseEntity<Category> createCategory(@RequestBody Category category) {
        return ResponseEntity.ok(categoryRepository.save(category));
    }
}
