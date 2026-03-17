export function truncateAddress(addressAsBase58String: string) {
  return (
    addressAsBase58String.slice(0, 4) + "..." + addressAsBase58String.slice(-4)
  );
}

export function run<T>(fn: () => T): T {
  return fn();
}
