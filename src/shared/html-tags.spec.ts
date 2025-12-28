import { describe, it, expect } from 'vitest';
import { HTML_TAGS, isValidHTMLTag } from './html-tags';

describe('HTML_TAGS', () => {
  it('should contain expected number of HTML5 tags', () => {
    // Should have around 110 official HTML5 tags
    expect(HTML_TAGS.length).toBeGreaterThanOrEqual(100);
    expect(HTML_TAGS.length).toBeLessThanOrEqual(120);
  });

  it.each([
    'html', 'head', 'body', 'title', 'meta', 'link',
    'div', 'span', 'p', 'a', 'img',
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'ul', 'ol', 'li',
    'table', 'tr', 'td', 'th',
    'form', 'input', 'button', 'select', 'textarea',
    'nav', 'header', 'footer', 'section', 'article'
  ])('should contain common HTML tag: %s', (tag) => {
    expect(HTML_TAGS).toContain(tag);
  });

  it.each([
    'article', 'aside', 'details', 'figcaption', 'figure',
    'footer', 'header', 'main', 'mark', 'nav',
    'section', 'summary', 'time'
  ])('should contain HTML5 semantic tag: %s', (tag) => {
    expect(HTML_TAGS).toContain(tag);
  });

  it.each(['audio', 'video', 'source', 'track', 'canvas'])('should contain media tag: %s', (tag) => {
    expect(HTML_TAGS).toContain(tag);
  });

  it('should contain all tags in lowercase', () => {
    HTML_TAGS.forEach((tag: string) => {
      expect(tag).toBe(tag.toLowerCase());
    });
  });

  it('should not contain duplicate tags', () => {
    const uniqueTags = new Set(HTML_TAGS);
    expect(uniqueTags.size).toBe(HTML_TAGS.length);
  });

  it('should be sorted alphabetically', () => {
    const sorted = [...HTML_TAGS].sort();
    expect(HTML_TAGS).toEqual(sorted);
  });

  it.each(['notreal', 'fake', 'xyz', 'custom', 'mytag'])('should not contain invalid tag: %s', (tag) => {
    expect(HTML_TAGS).not.toContain(tag);
  });

  it.each([
    'form', 'input', 'button', 'select', 'option',
    'textarea', 'label', 'fieldset', 'legend'
  ])('should contain form-related tag: %s', (tag) => {
    expect(HTML_TAGS).toContain(tag);
  });

  it.each(['s', 'u'])('should contain deprecated but valid HTML5 tag: %s', (tag) => {
    expect(HTML_TAGS).toContain(tag);
  });
});

describe('isValidHTMLTag', () => {
  it.each(['div', 'span', 'button', 'nav'])('should validate common HTML tag: %s', (tag) => {
    expect(isValidHTMLTag(tag)).toBe(true);
  });

  it.each(['notreal', 'fake', 'xyz', 'custom'])('should reject invalid tag: %s', (tag) => {
    expect(isValidHTMLTag(tag)).toBe(false);
  });

  it.each(['DIV', 'Div', 'dIv', 'BUTTON'])('should be case insensitive for tag: %s', (tag) => {
    expect(isValidHTMLTag(tag)).toBe(true);
  });

  it('should handle empty string', () => {
    expect(isValidHTMLTag('')).toBe(false);
  });

  it.each(['   ', '\t', '\n'])('should handle whitespace: %p', (tag) => {
    expect(isValidHTMLTag(tag)).toBe(false);
  });

  it.each([' div', 'div ', ' div '])('should reject tag with extra whitespace: %p', (tag) => {
    expect(isValidHTMLTag(tag)).toBe(false);
  });

  it.each(['article', 'aside', 'footer', 'header', 'nav', 'section'])('should validate HTML5 semantic tag: %s', (tag) => {
    expect(isValidHTMLTag(tag)).toBe(true);
  });

  it.each(['form', 'input', 'button', 'select', 'textarea', 'label'])('should validate form element: %s', (tag) => {
    expect(isValidHTMLTag(tag)).toBe(true);
  });

  it.each(['div!', 'div@', 'div#', '<div>'])('should reject tag with special characters: %p', (tag) => {
    expect(isValidHTMLTag(tag)).toBe(false);
  });
});
