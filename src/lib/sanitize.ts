/**
 * Control characters (excluding tab, newline and carriage return) have no legitimate place
 * in a profile field or a company submission, and can be used to smuggle formatting past a
 * reviewer or into a model prompt. Built from a string rather than written as a regex
 * literal so the source file itself never contains raw control bytes.
 */
const CONTROL_CHARS = new RegExp("[\\u0000-\\u0008\\u000B\\u000C\\u000E-\\u001F\\u007F]", "g");

export function stripControlChars(value: string): string {
  return value.replace(CONTROL_CHARS, "");
}
