import { Pipe, PipeTransform, inject } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Pipe({ name: 'highlight', standalone: true })
export class HighlightPipe implements PipeTransform {
	private sanitizer = inject(DomSanitizer);

	transform(text: string | undefined | null, targets: string | string[]): SafeHtml | string {
		if (!text || !targets) return text ?? '';

		const suchBegriffe = Array.isArray(targets) ? targets : [targets];
		let transformierterText = text;

		suchBegriffe.forEach(begriff => {
			const safeSearch = begriff.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
			const regex = new RegExp(`(${safeSearch})`, 'gi');
			transformierterText = transformierterText.replace(regex, '<br><br><b>$1</b><br>');
		});
		
		const finalesErgebnis = transformierterText.replace(/^(<br>|<br\s*\/?>)*/i, '').trim();
		return this.sanitizer.bypassSecurityTrustHtml(finalesErgebnis);
	}
}