import { createSolanaRpc, address } from "@solana/kit";

const rpc = createSolanaRpc("http://127.0.0.1:8899");
const programAccount = rpc.getAccountInfo(
  address("EpF1FNjziFb8wrR1p5usVW1AbcU7saCt8deoiVY31zE7")
);
console.log(programAccount);
