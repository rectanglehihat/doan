/**
 * JSON-LD 구조화 데이터를 HTML <script> 태그에 안전하게 삽입하기 위한 직렬화 함수.
 * JSON.stringify는 <, >, & 문자를 이스케이핑하지 않으므로,
 * </script> 주입 공격을 막기 위해 유니코드 이스케이핑을 적용한다.
 */
export function stringifyJsonLd(value: unknown): string {
  return JSON.stringify(value)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026');
}
