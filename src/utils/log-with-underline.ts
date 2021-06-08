export function logWithUnderline(str: string): string {
  return `
${str}
${Array(str.length + 1).join('-')}`;
}
