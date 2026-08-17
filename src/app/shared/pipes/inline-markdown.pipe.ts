import { Pipe, PipeTransform } from '@angular/core';

/**
 * Renders a small, deliberately-restricted subset of Markdown — only `**bold**` — typed by admins
 * in question text blocks / explanations. Escapes HTML first so user text can never inject
 * arbitrary markup; only our own `<strong>` tags are added on top. Angular's `[innerHTML]` binding
 * sanitizes on top of this as defense-in-depth, but we don't rely on that alone.
 */
@Pipe({ name: 'inlineMarkdown' })
export class InlineMarkdownPipe implements PipeTransform {
  transform(value: string | null | undefined): string {
    if (!value) {
      return '';
    }
    const escaped = value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
    return escaped.replace(/\*\*([\s\S]+?)\*\*/g, '<strong>$1</strong>');
  }
}
