package com.example.FinFlow.model;

import jakarta.persistence.*;
import lombok.*;
import com.fasterxml.jackson.annotation.JsonIgnore;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "users")
@Data
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long userId;

    @Column(unique = true, nullable = false)
    private String username;

    @Column(unique = true, nullable = false)
    private String email;

    private String fullName;

    @Column(nullable = false)
    @JsonIgnore
    private String password;

    @OneToMany(mappedBy = "user")
    @JsonIgnore
    private List<Account> accounts;

    @OneToMany(mappedBy = "user")
    @JsonIgnore
    private List<Category> categories;

    @OneToMany(mappedBy = "user")
    @JsonIgnore
    private List<Budget> budgets;

    @OneToMany(mappedBy = "user")
    @JsonIgnore
    private List<Goal> goals;

    @Column(name = "avatar_url", columnDefinition = "TEXT")
    private String avatarUrl;
}
