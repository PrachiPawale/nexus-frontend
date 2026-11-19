import { Component, OnInit } from "@angular/core";
import { DashboardService } from "../../services/dashboard.service";
import { CommonModule } from "@angular/common";

@Component({
  selector: "app-dashboard",
  templateUrl: "./dashboard.component.html",
  styleUrls: ["./dashboard.component.css"],
})
export class DashboardComponent implements OnInit {
  dashboardData: any = null;

  loading = true;
  error = "";

  userId = 1;

  constructor(private dashboardService: DashboardService) {}

  ngOnInit(): void {
    this.loadDashboard();
  }

  loadDashboard(): void {
    this.loading = true;
    this.error = "";

    this.dashboardService.getDashboard(this.userId).subscribe({
      next: (response: any) => {
        console.log("Dashboard API Response:", response);

        // Handle different API response structures
        this.dashboardData = response?.data || response;

        console.log("Dashboard Data Loaded:", this.dashboardData);

        this.loading = false;
      },

      error: (err) => {
        console.error("Dashboard API Error:", err);

        this.error = "Unable to load dashboard data.";
        this.loading = false;
      },
    });
  }
}
