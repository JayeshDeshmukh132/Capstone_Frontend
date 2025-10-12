// tiny JWT parser (no external libs). Returns payload typed as unknown.
export function parseJwt(token: string): unknown | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const payload = parts[1];
    // atob for base64url -> base64
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    // decode base64 to JSON string
    const json = decodeURIComponent(
      Array.prototype.map
        .call(atob(base64), (c: string) => {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join('')
    );
    return JSON.parse(json);
  } catch {
    return null;
  }
}
