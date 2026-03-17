import { HXUI_PROGRAM_ADDRESS } from "@/clients/generated/hxui";
import { findAssociatedTokenPda } from "@solana-program/token";
import {
  getProgramDerivedAddress,
  Address,
  getAddressEncoder,
} from "@solana/kit";
import { TOKEN_2022_PROGRAM_ADDRESS } from "./constants";
let hxuiMintAddress: Address | undefined;
let hxuiLiteMintAddress: Address | undefined;
let hxuiConfigAddress: Address | undefined;
let hxuiPollAddress: Address | undefined;
let hxuiVaultAddress: Address | undefined;
let hxuiFreeTokensCounter: Address | undefined;

const textEncoder = new TextEncoder();
export async function getHxuiMintAddress() {
  if (!hxuiMintAddress) {
    const [address] = await getProgramDerivedAddress({
      programAddress: HXUI_PROGRAM_ADDRESS,
      seeds: [textEncoder.encode("hxui_mint")],
    });
    hxuiMintAddress = address;
  }
  return hxuiMintAddress;
}

export async function getHxuiLiteMintAddress() {
  if (!hxuiLiteMintAddress) {
    const [address] = await getProgramDerivedAddress({
      programAddress: HXUI_PROGRAM_ADDRESS,
      seeds: [
        new Uint8Array([
          104, 120, 117, 105, 95, 108, 105, 116, 101, 95, 109, 105, 110, 116,
        ]),
      ],
    });
    hxuiLiteMintAddress = address;
  }
  return hxuiLiteMintAddress;
}
export async function getHxuiTokenAddress({ owner }: { owner: Address }) {
  const mint = await getHxuiMintAddress();
  const [address] = await findAssociatedTokenPda({
    owner,
    mint,
    tokenProgram: TOKEN_2022_PROGRAM_ADDRESS,
  });
  return address;
}

export async function getHxuiLiteTokenAddress({ owner }: { owner: Address }) {
  const mint = await getHxuiLiteMintAddress();
  const [address] = await findAssociatedTokenPda({
    owner,
    mint,
    tokenProgram: TOKEN_2022_PROGRAM_ADDRESS,
  });
  return address;
}

export async function getRegistrationAccountAddress(seeds: { owner: Address }) {
  const ownerAddressInBytes = getAddressEncoder().encode(seeds.owner);
  const [address] = await getProgramDerivedAddress({
    programAddress: HXUI_PROGRAM_ADDRESS,
    seeds: [
      new Uint8Array([
        109, 105, 110, 116, 101, 100, 95, 116, 105, 109, 101, 115, 116, 97, 109,
        112,
      ]),
      ownerAddressInBytes,
    ],
  });
  return address;
}

export async function getHxuiConfigAddress() {
  if (!hxuiConfigAddress) {
    const [address] = await getProgramDerivedAddress({
      programAddress: HXUI_PROGRAM_ADDRESS,
      seeds: [
        new Uint8Array([104, 120, 117, 105, 95, 99, 111, 110, 102, 105, 103]),
      ],
    });
    hxuiConfigAddress = address;
  }
  return hxuiConfigAddress;
}

export async function getHxuiPollAddress() {
  if (!hxuiPollAddress) {
    const [address] = await getProgramDerivedAddress({
      programAddress: HXUI_PROGRAM_ADDRESS,
      seeds: [new Uint8Array([104, 120, 117, 105, 95, 112, 111, 108, 108])],
    });
    hxuiPollAddress = address;
  }
  return hxuiPollAddress;
}

export async function getHxuiVaultAddress() {
  if (!hxuiVaultAddress) {
    const [address] = await getProgramDerivedAddress({
      programAddress: HXUI_PROGRAM_ADDRESS,
      seeds: [new Uint8Array([104, 120, 117, 105, 95, 118, 97, 117, 108, 116])],
    });
    hxuiVaultAddress = address;
  }
  return hxuiVaultAddress;
}

export async function getVoteReceiptAddress(dynamicSeeds: {
  candidateName: string;
  owner: Address;
}) {
  const [address] = await getProgramDerivedAddress({
    programAddress: HXUI_PROGRAM_ADDRESS,
    seeds: [
      new Uint8Array([
        118, 111, 116, 101, 95, 114, 101, 99, 101, 105, 112, 116,
      ]),
      new TextEncoder().encode(dynamicSeeds.candidateName),
      getAddressEncoder().encode(dynamicSeeds.owner),
    ],
  });
  return address;
}

export async function getCandidateAddress(dynamicSeeds: {
  candidateName: string;
}) {
  const [address] = await getProgramDerivedAddress({
    programAddress: HXUI_PROGRAM_ADDRESS,
    seeds: [
      new Uint8Array([
        104, 120, 117, 105, 95, 99, 97, 110, 100, 105, 100, 97, 116, 101,
      ]),
      new TextEncoder().encode(dynamicSeeds.candidateName),
    ],
  });
  return address;
}

export async function getFreeTokensCounterAddress() {
  if (!hxuiFreeTokensCounter) {
    const [address] = await getProgramDerivedAddress({
      programAddress: HXUI_PROGRAM_ADDRESS,
      seeds: [
        new Uint8Array([
          104, 120, 117, 105, 95, 102, 114, 101, 101, 95, 116, 111, 107, 101,
          110, 115, 95, 99, 111, 117, 110, 116, 101, 114,
        ]),
      ],
    });
    hxuiFreeTokensCounter = address;
  }
  return hxuiFreeTokensCounter;
}
