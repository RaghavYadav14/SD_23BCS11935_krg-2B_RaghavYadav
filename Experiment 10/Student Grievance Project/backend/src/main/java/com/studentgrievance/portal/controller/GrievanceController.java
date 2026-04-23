package com.studentgrievance.portal.controller;

import com.studentgrievance.portal.dto.GrievanceDtos;
import com.studentgrievance.portal.model.Grievance;
import com.studentgrievance.portal.model.GrievanceStatus;
import com.studentgrievance.portal.model.Priority;
import com.studentgrievance.portal.model.User;
import com.studentgrievance.portal.repository.GrievanceRepository;
import com.studentgrievance.portal.repository.UserRepository;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/grievances")
public class GrievanceController {
    private final GrievanceRepository grievanceRepository;
    private final UserRepository userRepository;

    public GrievanceController(GrievanceRepository grievanceRepository, UserRepository userRepository) {
        this.grievanceRepository = grievanceRepository;
        this.userRepository = userRepository;
    }

    @PostMapping
    public ResponseEntity<?> create(@Valid @RequestBody GrievanceDtos.CreateRequest request) {
        Optional<User> studentOpt = userRepository.findById(request.studentId);
        if (studentOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Student not found");
        }
        Grievance g = new Grievance();
        g.setTitle(request.title);
        g.setDescription(request.description);
        g.setStudent(studentOpt.get());
        if (request.priority != null && !request.priority.trim().isEmpty()) {
            try {
                g.setPriority(Priority.valueOf(request.priority.toUpperCase()));
            } catch (IllegalArgumentException e) {
                // Keep default priority
            }
        }
        Grievance saved = grievanceRepository.save(g);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(map(saved));
    }

    @GetMapping("/mine")
    public List<GrievanceDtos.GrievanceResponse> mine(@RequestParam("studentId") Long studentId) {
        return grievanceRepository.findByStudent_IdOrderByCreatedAtDesc(studentId)
                .stream().map(this::map).collect(Collectors.toList());
    }

    @GetMapping("/all")
    public List<GrievanceDtos.GrievanceResponse> all() {
        return grievanceRepository.findAll().stream()
                .sorted((a,b) -> b.getCreatedAt().compareTo(a.getCreatedAt()))
                .map(this::map).collect(Collectors.toList());
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateStatus(@PathVariable("id") Long id, @RequestParam("status") String status) {
        Optional<Grievance> opt = grievanceRepository.findById(id);
        if (opt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Grievance not found");
        }
        Grievance g = opt.get();
        if (g.getStatus() == GrievanceStatus.RESOLVED || g.getStatus() == GrievanceStatus.REJECTED) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Grievance is in a final state and cannot change status");
        }
        if (status == null || status.trim().isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Missing status parameter");
        }
        GrievanceStatus newStatus;
        try {
            newStatus = GrievanceStatus.valueOf(status.trim().toUpperCase());
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Invalid status. Allowed: OPEN, IN_PROGRESS, RESOLVED, REJECTED");
        }
        g.setStatus(newStatus);
        grievanceRepository.save(g);
        return ResponseEntity.ok(map(g));
    }

    @PutMapping("/{id}/reject")
    public ResponseEntity<?> reject(@PathVariable("id") Long id, @Valid @RequestBody GrievanceDtos.RejectRequest request) {
        Optional<Grievance> opt = grievanceRepository.findById(id);
        if (opt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Grievance not found");
        }
        Grievance g = opt.get();
        if (g.getStatus() == GrievanceStatus.RESOLVED || g.getStatus() == GrievanceStatus.REJECTED) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Grievance is in a final state and cannot be rejected");
        }
        g.setStatus(GrievanceStatus.REJECTED);
        g.setRejectionFeedback(request.feedback);
        grievanceRepository.save(g);
        return ResponseEntity.ok(map(g));
    }

    @PutMapping("/{id}/priority")
    public ResponseEntity<?> updatePriority(@PathVariable("id") Long id, @Valid @RequestBody GrievanceDtos.UpdatePriorityRequest request) {
        Optional<Grievance> opt = grievanceRepository.findById(id);
        if (opt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Grievance not found");
        }
        Grievance g = opt.get();
        if (g.getStatus() == GrievanceStatus.RESOLVED || g.getStatus() == GrievanceStatus.REJECTED) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Grievance is in a final state and cannot change priority");
        }
        try {
            g.setPriority(Priority.valueOf(request.priority.toUpperCase()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Invalid priority. Allowed: LOW, MEDIUM, HIGH, URGENT");
        }
        grievanceRepository.save(g);
        return ResponseEntity.ok(map(g));
    }

    @PutMapping("/{id}/comment")
    public ResponseEntity<?> addComment(@PathVariable("id") Long id, @Valid @RequestBody GrievanceDtos.AddCommentRequest request) {
        Optional<Grievance> opt = grievanceRepository.findById(id);
        if (opt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Grievance not found");
        }
        Grievance g = opt.get();
        if (g.getStatus() == GrievanceStatus.RESOLVED || g.getStatus() == GrievanceStatus.REJECTED) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Grievance is in a final state and cannot accept new comments");
        }
        String existing = g.getAdminComments();
        String newComment = request.comment;
        if (existing != null && !existing.trim().isEmpty()) {
            g.setAdminComments(existing + "\n\n--- " + java.time.Instant.now().toString() + " ---\n" + newComment);
        } else {
            g.setAdminComments(newComment);
        }
        grievanceRepository.save(g);
        return ResponseEntity.ok(map(g));
    }

    private GrievanceDtos.GrievanceResponse map(Grievance g) {
        String created = g.getCreatedAt() != null ? g.getCreatedAt().toString() : null;
        return new GrievanceDtos.GrievanceResponse(
                g.getId(),
                g.getTitle(),
                g.getDescription(),
                g.getStatus().name(),
                g.getPriority() != null ? g.getPriority().name() : "MEDIUM",
                g.getRejectionFeedback(),
                g.getAdminComments(),
                g.getStudent().getId(),
                g.getStudent().getFullName(),
                created
        );
    }
}


