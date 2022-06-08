export function stripFormat(value: string): string {
  if (value) {
    return value.replace(/[^0-9.]/g, '').replace(/^0+/, '');
  } else return value;
}
