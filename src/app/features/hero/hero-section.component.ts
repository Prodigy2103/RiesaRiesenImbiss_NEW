import { Component } from '@angular/core';
import { HeroThreeComponent } from './hero-three/hero-three.component';

@Component({
	standalone: true,
	selector: 'feature-hero-section',
	imports: [
		HeroThreeComponent
	],
	template: `
    <feature-hero-three></feature-hero-three>
`,
	styles: [`
		:host {
			display: block;
			width: 100%;
			height: 100%;
			overflow: hidden;
		}
	`]
})
/**
 * Serves as a container for the Hero section features.
 * Why: Orchestrates hero-related components to keep the main layout clean.
 */
export class HeroSectionComponent { }

export { HeroThreeComponent };