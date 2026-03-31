package com.example.FinFlow.model;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "goals")
@Data
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class Goal {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long goalId;

    private String name;
    private BigDecimal targetAmount;
    private BigDecimal currentAmount;
    private String category;
    private LocalDate deadline;
    private String imageUrl;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;
}
