export function truncateAddress(addressAsBase58String: string) {
  return (
    addressAsBase58String.slice(0, 4) +
    ".".repeat(2) +
    addressAsBase58String.slice(-4)
  );
}

export function run<T>(fn: () => T): T {
  return fn();
}
