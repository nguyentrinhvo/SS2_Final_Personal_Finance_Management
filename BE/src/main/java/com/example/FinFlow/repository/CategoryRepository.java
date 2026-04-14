package com.example.FinFlow.repository;

import com.example.FinFlow.model.Category;
import com.example.FinFlow.model.TransactionType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CategoryRepository extends JpaRepository<Category, Long> {
    List<Category> findByUser_UserIdOrUserIsNull(Long userId);
    List<Category> findByUser_UserId(Long userId);
    List<Category> findByType(TransactionType type);
}
