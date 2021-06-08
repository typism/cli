export const strPadding = (str: string, n: number, c?: string) => {
  const val = str.valueOf();
  if (Math.abs(+n) <= val.length) return val;
  const m = Math.max(Math.abs(n) - str.length || 0, 0);
  const pad = Array(m + 1).join(String(c || ' ').charAt(0));
  return n < 0 ? pad + val : val + pad;
};
