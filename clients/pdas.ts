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
let hxuiDropTimeAddress: Address | undefined;
let hxuiVaultAddress: Address | undefined;
let hxuiFreeMintCounter: Address | undefined;

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
      seeds: [textEncoder.encode("hxui_lite_mint")],
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

export async function getFreeMintTrackerAddress(seeds: { owner: Address }) {
  const ownerAddressInBytes = getAddressEncoder().encode(seeds.owner);
  const [address] = await getProgramDerivedAddress({
    programAddress: HXUI_PROGRAM_ADDRESS,
    seeds: [textEncoder.encode("free_mint_tracker"), ownerAddressInBytes],
  });
  return address;
}

export async function getHxuiConfigAddress() {
  if (!hxuiConfigAddress) {
    const [address] = await getProgramDerivedAddress({
      programAddress: HXUI_PROGRAM_ADDRESS,
      seeds: [textEncoder.encode("hxui_config")],
    });
    hxuiConfigAddress = address;
  }
  return hxuiConfigAddress;
}

export async function getHxuiDropTimeAddress() {
  if (!hxuiDropTimeAddress) {
    const [address] = await getProgramDerivedAddress({
      programAddress: HXUI_PROGRAM_ADDRESS,
      seeds: [textEncoder.encode("hxui_drop_time")],
    });
    hxuiDropTimeAddress = address;
  }
  return hxuiDropTimeAddress;
}

export async function getHxuiVaultAddress() {
  if (!hxuiVaultAddress) {
    const [address] = await getProgramDerivedAddress({
      programAddress: HXUI_PROGRAM_ADDRESS,
      seeds: [textEncoder.encode("hxui_vault")],
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
      textEncoder.encode("vote_receipt"),
      textEncoder.encode(dynamicSeeds.candidateName),
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
      textEncoder.encode("hxui_candidate"),
      new TextEncoder().encode(dynamicSeeds.candidateName),
    ],
  });
  return address;
}

export async function getFreeMintCounterAddress() {
  if (!hxuiFreeMintCounter) {
    const [address] = await getProgramDerivedAddress({
      programAddress: HXUI_PROGRAM_ADDRESS,
      seeds: [textEncoder.encode("hxui_free_mint_counter")],
    });
    hxuiFreeMintCounter = address;
  }
  return hxuiFreeMintCounter;
}
