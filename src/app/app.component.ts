import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from "./core/layout/sidebar/sidebar.component";
import { HeaderComponent } from "./core/layout/header/header.component";
import { FooterComponent } from "./core/layout/footer/footer.component";
import { UiService } from './shared/services/ui.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NeonButtonComponent } from './shared/ui/neon-button/neon-button.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, SidebarComponent, HeaderComponent, FooterComponent, CommonModule, FormsModule, NeonButtonComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'RiesaRiesenImbiss';

  public ui = inject(UiService);
}
