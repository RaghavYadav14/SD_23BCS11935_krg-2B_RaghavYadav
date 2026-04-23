package com.studentgrievance.portal.repository;

import com.studentgrievance.portal.model.Grievance;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface GrievanceRepository extends JpaRepository<Grievance, Long> {
    List<Grievance> findByStudent_IdOrderByCreatedAtDesc(Long studentId);
}




