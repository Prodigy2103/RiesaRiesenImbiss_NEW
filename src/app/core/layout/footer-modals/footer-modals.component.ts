import { Component, inject } from '@angular/core';
import { NeonButtonComponent } from "../../../shared/ui/neon-button/neon-button.component";
import { UiService } from '../../../shared/services/ui.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-footer-modals',
  imports: [NeonButtonComponent, FormsModule],
  templateUrl: './footer-modals.component.html',
  styleUrl: './footer-modals.component.scss'
})
export class FooterModalsComponent {
public ui = inject(UiService);
}
