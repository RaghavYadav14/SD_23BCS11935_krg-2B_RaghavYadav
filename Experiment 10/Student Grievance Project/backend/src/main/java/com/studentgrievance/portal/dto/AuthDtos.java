package com.studentgrievance.portal.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public class AuthDtos {
    public static class LoginRequest {
        @Email
        @NotBlank
        public String email;

        @NotBlank
        public String password;
    }

    public static class RegisterRequest {
        @NotBlank
        public String fullName;

        @Email
        @NotBlank
        public String email;

        @NotBlank
        public String password;
    }

    public static class AuthResponse {
        public Long id;
        public String fullName;
        public String email;
        public String role;

        public AuthResponse(Long id, String fullName, String email, String role) {
            this.id = id;
            this.fullName = fullName;
            this.email = email;
            this.role = role;
        }
    }
}





