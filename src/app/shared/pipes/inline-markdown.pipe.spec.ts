import { describe, expect, it } from 'vitest';

import { InlineMarkdownPipe } from './inline-markdown.pipe';

describe('InlineMarkdownPipe', () => {
  const pipe = new InlineMarkdownPipe();

  it('returns an empty string for null/undefined/empty input', () => {
    expect(pipe.transform(null)).toBe('');
    expect(pipe.transform(undefined)).toBe('');
    expect(pipe.transform('')).toBe('');
  });

  it('converts **bold** markers to <strong> tags', () => {
    expect(pipe.transform('Ceci est **important** à retenir')).toBe(
      'Ceci est <strong>important</strong> à retenir'
    );
  });

  it('handles multiple bold spans', () => {
    expect(pipe.transform('**A** et **B**')).toBe('<strong>A</strong> et <strong>B</strong>');
  });

  it('escapes HTML special characters so user text cannot inject markup', () => {
    expect(pipe.transform('<img src=x onerror=alert(1)> & "quotes"')).toBe(
      '&lt;img src=x onerror=alert(1)&gt; &amp; "quotes"'
    );
  });

  it('leaves plain text without markers untouched (aside from escaping)', () => {
    expect(pipe.transform('Pas de mise en forme ici')).toBe('Pas de mise en forme ici');
  });
});
