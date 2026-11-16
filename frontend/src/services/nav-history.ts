/**
 * Tiny in-memory navigation history so the in-app Back button returns to the
 * screen the traveller actually came from — not the stack anchor.
 *
 * expo-router's tab navigation jumps between tabs without pushing onto the
 * native stack, so `router.back()` from a tab falls through to the anchor
 * (Home). We instead record each visited path (driven by `usePathname()` in the
 * root layout) and let the Back button navigate to the previous distinct one.
 */

let stack: string[] = [];

/** Record a visit, including a return to a tab visited earlier. */
export function recordPath(path: string): void {
  if (!path) return;
  if (stack[stack.length - 1] === path) return;
  stack.push(path);
  if (stack.length > 25) stack.shift();
}

/** Pop the current visit before navigating so Back does not bounce forward. */
export function takePreviousPath(): string | null {
  if (stack.length < 2) return null;
  stack.pop();
  return stack[stack.length - 1];
}
