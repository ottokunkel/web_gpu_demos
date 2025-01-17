export function fail(message: string) {
  alert(message);
  throw new Error(message);
}
