import {sanitizeText} from "../utils/sanitize";

describe('sanitizeText', () => {
    it('removes <script> tags and their content', () => {
        const result = sanitizeText('<script>alert("x")</script>');
        expect(result).toBe('');
    });

    it('strips tags but keeps content', () => {
        const result = sanitizeText('<b>Hello</b>');
        expect(result).toBe('Hello');
    });

    it('removes dangerous attributes from tags (if tags allowed)', () => {
        const result = sanitizeText('<img src=x onerror="alert(1)">');
        expect(result).toBe('');
    });

    it('preserves plain text', () => {
        const result = sanitizeText('Normal message with no tags');
        expect(result).toBe('Normal message with no tags');
    });

    it('removes malformed HTML', () => {
        const result = sanitizeText('<div><strong>Badly nested');
        expect(result).toBe('Badly nested');
    });

    it('trims leading and trailing whitespace', () => {
        const result = sanitizeText('   hello world   ');
        expect(result).toBe('hello world');
    });

    it('removes style and iframe tags', () => {
        const result = sanitizeText('<style>body {}</style><iframe src="x"></iframe>');
        expect(result).toBe('');
    });

    it('removes comments', () => {
        const result = sanitizeText('<!-- This is a comment -->');
        expect(result).toBe('');
    });

    it('escapes angle brackets left in plain text', () => {
        const result = sanitizeText('2 < 3 and 5 > 1');
        expect(result).toBe('2 < 3 and 5 > 1');
    });
});