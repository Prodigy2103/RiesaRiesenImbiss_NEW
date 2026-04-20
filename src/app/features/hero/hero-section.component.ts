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
`
})
/**
 * Serves as a container for the Hero section features.
 * Why: Orchestrates hero-related components to keep the main layout clean.
 */
export class HeroSectionComponent { }

export { HeroThreeComponent };