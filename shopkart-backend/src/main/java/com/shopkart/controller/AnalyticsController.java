package com.shopkart.controller;

import com.shopkart.dto.AnalyticsDashboardDTO;
import com.shopkart.service.AnalyticsService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/analytics")
@CrossOrigin(origins = "http://localhost:4200")
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    public AnalyticsController(AnalyticsService analyticsService) {
        this.analyticsService = analyticsService;
    }

    @GetMapping("/dashboard")
    public ResponseEntity<AnalyticsDashboardDTO> getDashboard() {

        AnalyticsDashboardDTO dashboard =
                analyticsService.getDashboard();

        return ResponseEntity.ok(dashboard);
    }
}