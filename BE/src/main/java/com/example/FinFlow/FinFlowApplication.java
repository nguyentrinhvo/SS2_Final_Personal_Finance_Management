package com.example.FinFlow;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class FinFlowApplication {

	@org.springframework.beans.factory.annotation.Autowired
	private org.springframework.jdbc.core.JdbcTemplate jdbcTemplate;

	@jakarta.annotation.PostConstruct
	public void updateDbScheme() {
		try {
			jdbcTemplate.execute("ALTER TABLE categories MODIFY COLUMN image_url TEXT");
			jdbcTemplate.execute("ALTER TABLE accounts MODIFY COLUMN image_url TEXT");
			jdbcTemplate.execute("ALTER TABLE budgets MODIFY COLUMN image_url TEXT");
			jdbcTemplate.execute("ALTER TABLE goals MODIFY COLUMN image_url TEXT");
		} catch(Exception e) {
			System.out.println("Schema update skipped or failed: " + e.getMessage());
		}
	}

	public static void main(String[] args) {
		SpringApplication.run(FinFlowApplication.class, args);
	}

}
