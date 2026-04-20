import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NeonButtonComponent } from "../../../shared/ui/neon-button/neon-button.component";
import { OrderService } from '../../../shared/services/order.service';
import { ReviewService } from '../../../shared/services/review.service';

@Component({
  standalone: true,
  selector: 'feature-hero-three',
  templateUrl: './hero-three.component.html',
  styleUrls: ['./hero-three.component.scss'],
  imports: [NeonButtonComponent]
})
export class HeroThreeComponent implements OnInit {
  private MAX_ROTATE = 15;
  public target = { rx: 0, ry: 0, mx: 50, my: 50 };
  public current = { rx: 0, ry: 0, mx: 50, my: 50 };
  private router = inject(Router);
  public order = inject(OrderService);
  private reviewService = inject(ReviewService);

  /**
   * Starts the animation loop on initialization.
   * Why: To ensure smooth visual transitions from the start.
   */
  ngOnInit() {
    this.animate();
  }

  averageRating = this.reviewService.averageRating;

  private lerp = (a: number, b: number, t: number) => a + (b - a) * t;

  /**
   * Main animation loop for 3D effects.
   * Why: Constantly updates visual state via requestAnimationFrame.
   */
  private animate() {
    this.updateCurrentValues();
    requestAnimationFrame(() => this.animate());
  }

  private updateCurrentValues() {
    this.current.rx = this.lerp(this.current.rx, this.target.rx, 0.08);
    this.current.ry = this.lerp(this.current.ry, this.target.ry, 0.08);
    this.current.mx = this.lerp(this.current.mx, this.target.mx, 0.12);
    this.current.my = this.lerp(this.current.my, this.target.my, 0.12);
  }

  /**
   * Handles mouse entry into the hero area.
   * Why: Placeholder for future visual "lift" or hover effects.
   */
  onMouseEnter() {
    // Logic can be added here if a hover-start effect is needed
  }

  /**
   * Calculates rotation and shine targets based on mouse position.
   * @param e The mouse movement event.
   */
  onMouseMove(e: MouseEvent) {
    const el = e.currentTarget as HTMLElement;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    this.target.mx = (x / rect.width) * 100;
    this.target.my = (y / rect.height) * 100;
    this.target.ry = ((x / rect.width) - 0.5) * (this.MAX_ROTATE * 2);
    this.target.rx = ((y / rect.height) - 0.5) * -(this.MAX_ROTATE * 2);
  }

  /**
   * Resets the card position when the mouse leaves.
   */
  onMouseLeave() {
    this.target = { rx: 0, ry: 0, mx: 50, my: 50 };
  }

  /**
   * Navigates to the order page.
   */
  goToOrder() {
    this.order.step.set(1);
    this.router.navigate(['/order']);
  }
}