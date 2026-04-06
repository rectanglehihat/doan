import { describe, it, expect } from 'vitest';
import { stringifyJsonLd } from './json-ld';

describe('stringifyJsonLd', () => {
  it('일반 객체를 JSON 문자열로 직렬화한다', () => {
    const result = stringifyJsonLd({ '@type': 'WebApplication', name: '도안' });
    expect(result).toBe('{"@type":"WebApplication","name":"도안"}');
  });

  it('</script> 태그를 유니코드로 이스케이핑한다', () => {
    const result = stringifyJsonLd({ description: '</script><script>alert(1)</script>' });
    expect(result).not.toContain('</script>');
    expect(result).toContain('\\u003c/script\\u003e');
  });

  it('< 와 > 문자를 유니코드로 이스케이핑한다', () => {
    const result = stringifyJsonLd({ value: '<foo>' });
    expect(result).toContain('\\u003cfoo\\u003e');
  });

  it('& 문자를 유니코드로 이스케이핑한다', () => {
    const result = stringifyJsonLd({ value: 'a & b' });
    expect(result).toContain('a \\u0026 b');
  });

  it('중첩 객체도 올바르게 이스케이핑한다', () => {
    const result = stringifyJsonLd({ nested: { html: '<b>text</b>' } });
    expect(result).not.toContain('<b>');
    expect(result).toContain('\\u003cb\\u003etext\\u003c/b\\u003e');
  });
});
