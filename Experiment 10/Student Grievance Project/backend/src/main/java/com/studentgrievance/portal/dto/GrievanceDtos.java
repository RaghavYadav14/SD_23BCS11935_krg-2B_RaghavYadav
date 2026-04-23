package com.studentgrievance.portal.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class GrievanceDtos {
    public static class CreateRequest {
        @NotNull
        public Long studentId;
        @NotBlank
        public String title;
        @NotBlank
        public String description;
        public String priority;
    }

    public static class RejectRequest {
        @NotBlank
        public String feedback;
    }

    public static class UpdatePriorityRequest {
        @NotBlank
        public String priority;
    }

    public static class AddCommentRequest {
        @NotBlank
        public String comment;
    }

    public static class GrievanceResponse {
        public Long id;
        public String title;
        public String description;
        public String status;
        public String priority;
        public String rejectionFeedback;
        public String adminComments;
        public Long studentId;
        public String studentName;
        public String createdAt;

        public GrievanceResponse(Long id, String title, String description, String status, String priority, String rejectionFeedback, String adminComments, Long studentId, String studentName, String createdAt) {
            this.id = id;
            this.title = title;
            this.description = description;
            this.status = status;
            this.priority = priority;
            this.rejectionFeedback = rejectionFeedback;
            this.adminComments = adminComments;
            this.studentId = studentId;
            this.studentName = studentName;
            this.createdAt = createdAt;
        }
    }
}




