package com.example.FinFlow.service;

import com.example.FinFlow.model.Category;
import com.example.FinFlow.model.TransactionType;
import com.example.FinFlow.model.User;
import com.example.FinFlow.repository.CategoryRepository;
import com.example.FinFlow.repository.UserRepository;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

@Service
public class CategoryService {

    @Autowired
    private CategoryRepository categoryRepository;
    
    @Autowired
    private UserRepository userRepository;

    @PostConstruct
    public void seedCategories() {
        if (categoryRepository.count() == 0) {
            List<Category> defaultCategories = Arrays.asList(
                new Category(null, "Food", TransactionType.EXPENSE, null, null),
                new Category(null, "Transport", TransactionType.EXPENSE, null, null),
                new Category(null, "Rent", TransactionType.EXPENSE, null, null),
                new Category(null, "Shopping", TransactionType.EXPENSE, null, null),
                new Category(null, "Utilities", TransactionType.EXPENSE, null, null),
                new Category(null, "Salary", TransactionType.INCOME, null, null),
                new Category(null, "Business", TransactionType.INCOME, null, null),
                new Category(null, "Gift", TransactionType.INCOME, null, null)
            );
            categoryRepository.saveAll(defaultCategories);
        }
    }

    public List<Category> getCategoriesByUserId(Long userId) {
        return categoryRepository.findByUser_UserIdOrUserIsNull(userId);
    }

    public Category createCustomCategory(Long userId, Category details) {
        Optional<User> user = userRepository.findById(userId);
        if (user.isPresent()) {
            Category category = new Category();
            category.setName(details.getName());
            category.setType(details.getType());
            category.setUser(user.get());
            return categoryRepository.save(category);
        }
        return null;
    }

    public void deleteCategory(Long id) {
        categoryRepository.deleteById(id);
    }
}
