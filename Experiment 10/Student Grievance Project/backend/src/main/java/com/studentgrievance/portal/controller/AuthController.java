package com.studentgrievance.portal.controller;

import com.studentgrievance.portal.dto.AuthDtos;
import com.studentgrievance.portal.model.Role;
import com.studentgrievance.portal.model.User;
import com.studentgrievance.portal.repository.UserRepository;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final UserRepository userRepository;

    public AuthController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody AuthDtos.RegisterRequest request) {
        if (userRepository.findByEmail(request.email).isPresent()) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body("Email already registered");
        }
        User user = new User();
        user.setFullName(request.fullName);
        user.setEmail(request.email);
        user.setPassword(request.password); // per requirements, store plain text
        user.setRole(Role.STUDENT);
        User saved = userRepository.save(user);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new AuthDtos.AuthResponse(saved.getId(), saved.getFullName(), saved.getEmail(), saved.getRole().name()));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody AuthDtos.LoginRequest request) {
        Optional<User> userOpt = userRepository.findByEmail(request.email);
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid credentials");
        }
        User user = userOpt.get();
        if (!user.getPassword().equals(request.password)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid credentials");
        }
        return ResponseEntity.ok(new AuthDtos.AuthResponse(user.getId(), user.getFullName(), user.getEmail(), user.getRole().name()));
    }
}





