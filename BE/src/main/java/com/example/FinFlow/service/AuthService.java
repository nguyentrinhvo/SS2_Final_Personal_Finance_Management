package com.example.FinFlow.service;

import com.example.FinFlow.model.Category;
import com.example.FinFlow.model.TransactionType;
import com.example.FinFlow.model.User;
import com.example.FinFlow.repository.CategoryRepository;
import com.example.FinFlow.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Transactional
    public User register(String username, String email, String password, String fullName) {
        if (userRepository.findByUsername(username).isPresent()) {
            throw new RuntimeException("Username already exists");
        }
        if (userRepository.findByEmail(email).isPresent()) {
            throw new RuntimeException("Email already exists");
        }
        User user = new User();
        user.setUsername(username);
        user.setEmail(email);
        user.setFullName(fullName);
        user.setPassword(passwordEncoder.encode(password));
        User savedUser = userRepository.save(user);
        initializeCategories(savedUser);
        return savedUser;
    }

    private void initializeCategories(User user) {
        List<Category> coreCategories = new ArrayList<>();

        // Expense Categories
        coreCategories.add(createCategory("Food", TransactionType.EXPENSE, user));
        coreCategories.add(createCategory("Shopping", TransactionType.EXPENSE, user));
        coreCategories.add(createCategory("Transportation", TransactionType.EXPENSE, user));

        // Income Categories
        coreCategories.add(createCategory("Salary", TransactionType.INCOME, user));

        categoryRepository.saveAll(coreCategories);
    }

    private Category createCategory(String name, TransactionType type, User user) {
        Category category = new Category();
        category.setName(name);
        category.setType(type);
        category.setUser(user);
        return category;
    }

    public Optional<User> login(String loginId, String password) {
        Optional<User> userOpt = userRepository.findByUsernameOrEmail(loginId, loginId);

        if (userOpt.isPresent()) {
            User user = userOpt.get();
            boolean matches = passwordEncoder.matches(password, user.getPassword());
            return matches ? Optional.of(user) : Optional.empty();
        }

        return Optional.empty();
    }

    public void resetPassword(String email, String newPassword) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found with this email"));
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }
}
