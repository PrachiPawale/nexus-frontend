import { Component, OnInit } from "@angular/core";
import { DashboardService } from "../../services/dashboard.service";

@Component({
  selector: "app-dashboard",
  templateUrl: "./dashboard.component.html",
  styleUrls: ["./dashboard.component.css"],
})
export class DashboardComponent implements OnInit {
  dashboardData: any = null;
  loading = true;
  error = "";

  // Temporary user ID for testing
  userId = 1;

  constructor(private dashboardService: DashboardService) {}

  ngOnInit(): void {
    this.loadDashboard();
  }

  loadDashboard(): void {
    this.loading = true;
    this.error = "";

    this.dashboardService.getDashboard(this.userId).subscribe({
      next: (data) => {
        console.log("Dashboard API response:", data);

        this.dashboardData = data;
        this.loading = false;
      },
      error: (err) => {
        console.error("Dashboard API error:", err);

        this.error = "Unable to load dashboard data.";
        this.loading = false;
      },
    });
  }
}
