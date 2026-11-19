import { Component, OnInit } from "@angular/core";
import { GoalService } from "../../services/goal.service";

@Component({
  selector: "app-goals",
  templateUrl: "./goals.component.html",
  styleUrls: ["./goals.component.css"],
})
export class GoalsComponent implements OnInit {
  goals: any[] = [];

  loading = true;
  error = "";

  showForm = false;
  editingGoalId: number | null = null;

  currentUserId = 1;

  goal = {
    user_id: this.currentUserId,
    title: "",
    description: "",
    progress: 0,
    target_date: "",
  };

  constructor(private goalService: GoalService) {}

  ngOnInit(): void {
    this.loadGoals();
  }

  // Load all goals
  loadGoals(): void {
    this.loading = true;
    this.error = "";

    this.goalService.getGoals(this.currentUserId).subscribe({
      next: (response: any) => {
        console.log("Goals API Response:", response);

        this.goals = Array.isArray(response)
          ? response
          : Array.isArray(response.goals)
          ? response.goals
          : Array.isArray(response.data)
          ? response.data
          : Array.isArray(response.data?.goals)
          ? response.data.goals
          : [];

        console.log("Goals loaded:", this.goals);

        this.loading = false;
      },

      error: (err) => {
        console.error("Error loading goals:", err);
        this.error = "Unable to load goals.";
        this.loading = false;
      },
    });
  }

  // Open add goal form
  openAddForm(): void {
    this.editingGoalId = null;

    this.goal = {
      user_id: this.currentUserId,
      title: "",
      description: "",
      progress: 0,
      target_date: "",
    };

    this.showForm = true;
  }

  // Open edit goal form
  openEditForm(goal: any): void {
    this.editingGoalId = goal.id;

    this.goal = {
      user_id: this.currentUserId,
      title: goal.title,
      description: goal.description || "",
      progress: goal.progress || 0,
      target_date: goal.target_date ? goal.target_date.substring(0, 10) : "",
    };

    this.showForm = true;
  }

  // Close form
  closeForm(): void {
    this.showForm = false;
    this.editingGoalId = null;
  }

  // Create or update goal
  saveGoal(): void {
    if (!this.goal.title.trim()) {
      alert("Please enter a goal title.");
      return;
    }

    if (this.goal.progress < 0 || this.goal.progress > 100) {
      alert("Progress must be between 0 and 100.");
      return;
    }

    this.goal.user_id = this.currentUserId;

    if (this.editingGoalId !== null) {
      this.goalService.updateGoal(this.editingGoalId, this.goal).subscribe({
        next: () => {
          this.closeForm();
          this.loadGoals();
        },
        error: (err) => {
          console.error("Error updating goal:", err);
          alert("Unable to update goal.");
        },
      });
    } else {
      this.goalService.createGoal(this.goal).subscribe({
        next: () => {
          this.closeForm();
          this.loadGoals();
        },
        error: (err) => {
          console.error("Error creating goal:", err);
          alert("Unable to create goal.");
        },
      });
    }
  }

  // Delete goal
  deleteGoal(id: number): void {
    if (!confirm("Are you sure you want to delete this goal?")) {
      return;
    }

    this.goalService.deleteGoal(id, this.currentUserId).subscribe({
      next: () => {
        this.loadGoals();
      },
      error: (err) => {
        console.error("Error deleting goal:", err);
        alert("Unable to delete goal.");
      },
    });
  }
}
