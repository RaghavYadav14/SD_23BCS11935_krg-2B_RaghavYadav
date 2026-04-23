package com.studentgrievance.portal.config;

import com.studentgrievance.portal.model.Role;
import com.studentgrievance.portal.model.User;
import com.studentgrievance.portal.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class DataSeeder {
    @Bean
    public CommandLineRunner seedAdmin(UserRepository userRepository) {
        return args -> {
            if (!userRepository.existsByRole(Role.ADMIN)) {
                User admin = new User();
                admin.setFullName("Portal Admin");
                admin.setEmail("admin@portal.com");
                admin.setPassword("admin123");
                admin.setRole(Role.ADMIN);
                userRepository.save(admin);
            }
        };
    }
}





