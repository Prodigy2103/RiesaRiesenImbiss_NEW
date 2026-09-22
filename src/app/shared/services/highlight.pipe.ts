import { Pipe, PipeTransform, inject } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Pipe({ name: 'highlight', standalone: true })
export class HighlightPipe implements PipeTransform {
  private readonly sanitizer: DomSanitizer = inject(DomSanitizer);

  transform(inputText: string | undefined | null, targetTerms: string | string[]): SafeHtml | string {
    if (!inputText || !targetTerms) return inputText ?? '';
    const sanitizedInput = this.escapeHtml(inputText);
    const searchTerms = Array.isArray(targetTerms) ? targetTerms : [targetTerms];
    const highlightedContent = searchTerms.reduce(
      (currentText, singleTerm) => this.highlightSingleTerm(currentText, singleTerm),
      sanitizedInput
    );
    const cleanedResult = highlightedContent.replace(/^(<br>|<br\s*\/?>)*/i, '').trim();
    return this.sanitizer.bypassSecurityTrustHtml(cleanedResult);
  }

  private escapeHtml(rawText: string): string {
    return rawText
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  private highlightSingleTerm(sourceContent: string, searchTerm: string): string {
    const escapedTerm = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const matchingPattern = new RegExp(`(${escapedTerm})`, 'gi');
    return sourceContent.replace(matchingPattern, '<br><br><b>$1</b><br>');
  }
}