"use client";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Field,
  FieldGroup,
  FieldDescription,
  FieldLabel,
  FieldContent,
} from "@/components/ui/field";
import { ChevronDownIcon, InfoIcon } from "lucide-react";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
  InputGroupTextarea,
} from "@/components/ui/input-group";
import { useSolanaClient } from "@/providers/solana-client";
import Button, {
  HxuiButton,
  HxuiButtonGroup,
} from "../../../../components/www/file-explorer/button";
import { usePrivyAsSolanaWallet } from "@/providers/privy-as-solana-wallet";
import {
  Address,
  address,
  appendTransactionMessageInstruction,
  appendTransactionMessageInstructions,
  Base58EncodedBytes,
  compileTransaction,
  createNoopSigner,
  createTransactionMessage,
  getProgramDerivedAddress,
  getTransactionEncoder,
  Instruction,
  isSolanaError,
  lamports,
  pipe,
  setTransactionMessageFeePayerSigner,
  setTransactionMessageLifetimeUsingBlockhash,
  SOLANA_ERROR__ACCOUNTS__ACCOUNT_NOT_FOUND,
  getBase58Decoder,
  StringifiedNumber,
  signTransaction,
  getSignatureFromTransaction,
  sendAndConfirmTransactionFactory,
} from "@solana/kit";
import { getCandidateAddress, getHxuiConfigAddress } from "@/clients/pdas";
import { Spinner } from "@/components/ui/spinner";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  fetchMaybeToken,
  getCreateAssociatedTokenInstructionAsync,
} from "@solana-program/token";
import { useState } from "react";
import { Switch } from "@/components/ui/switch";
import {
  fetchCandidate,
  fetchConfig,
  getCreateCandidateInstructionAsync,
} from "@/clients/generated/hxui";
import { pre } from "motion/react-client";
import { useProgramAccounts } from "../providers/program-accounts";
import { useCandidatesContext } from "../providers/candidates";
import { run } from "@/utils";

const DEFAULT_CANDIDATE_META = {
  name: "",
  description: "",
  claimableIfWinner: false,
};
function CreateCandidate() {
  const client = useSolanaClient();
  const { selectedWallet, signAndSendTransaction } = usePrivyAsSolanaWallet();
  const candidatesContext = useCandidatesContext();

  const [newCandidateMeta, setNewCandidateMeta] = useState(
    DEFAULT_CANDIDATE_META
  );
  const programAccounts = useProgramAccounts();
  async function createCandidate() {
    if (!selectedWallet)
      return console.error(
        "wallet not connected. please connect with your admin wallet to create a candidate"
      );

    if (programAccounts.isLoading)
      return console.error(
        "program accounts are loading. please wait and try again"
      );
    const selectedWalletAddress = address(selectedWallet.address);
    if (programAccounts.hxuiConfig.data.admin !== selectedWalletAddress)
      return console.error("only admin can create candidate");

    if (
      newCandidateMeta.name.length === 0 ||
      newCandidateMeta.description.length === 0
    ) {
      return console.error("name and description are required");
    }
    const adminSigner = createNoopSigner(selectedWalletAddress);

    const createCandidateIx = await getCreateCandidateInstructionAsync({
      admin: adminSigner,
      ...newCandidateMeta,
    });
    const { value: latestBlockhash } = await client.rpc
      .getLatestBlockhash()
      .send();
    const encodedTransactionMessage = pipe(
      createTransactionMessage({ version: 0 }),
      (tx) => setTransactionMessageFeePayerSigner(adminSigner, tx),
      (tx) => setTransactionMessageLifetimeUsingBlockhash(latestBlockhash, tx),
      (tx) => appendTransactionMessageInstruction(createCandidateIx, tx),
      (tx) => compileTransaction(tx),
      (tx) => new Uint8Array(getTransactionEncoder().encode(tx))
    );

    const { signature } = await signAndSendTransaction({
      transaction: encodedTransactionMessage,
      wallet: selectedWallet,
      options: { commitment: "confirmed" },
    });

    console.log(getBase58Decoder().decode(signature));

    if (candidatesContext.isLoading) return;

    setNewCandidateMeta(DEFAULT_CANDIDATE_META);

    const newCandidateAddress = await getCandidateAddress({
      candidateName: newCandidateMeta.name,
    });

    setTimeout(async () => {
      const newCandidate = await fetchCandidate(
        client.rpc,
        newCandidateAddress
      );
      candidatesContext.setCandidates((prev) => {
        return [...prev, newCandidate].sort((a, b) => b.data.id - a.data.id);
      });
    }, 500);
  }

  const disabled =
    !selectedWallet ||
    programAccounts.isLoading ||
    selectedWallet.address !== programAccounts.hxuiConfig.data.admin;
  return (
    <Popover>
      <HxuiButtonGroup>
        <Tooltip>
          <TooltipTrigger asChild>
            <span>
              <PopoverTrigger asChild disabled={disabled}>
                <HxuiButton>
                  Create candidate.
                  {programAccounts.isLoading ? (
                    <Spinner className="size-4" />
                  ) : (
                    <ChevronDownIcon className="size-4" />
                  )}
                </HxuiButton>
              </PopoverTrigger>
            </span>
          </TooltipTrigger>
          {run(() => {
            if (!selectedWallet) {
              return (
                <TooltipContent>
                  Please connect to a solana wallet
                </TooltipContent>
              );
            }
            if (programAccounts.isLoading) {
              return null;
            }

            if (
              selectedWallet.address != programAccounts.hxuiConfig.data.admin
            ) {
              return (
                <TooltipContent>
                  Only admin can perform this action.
                </TooltipContent>
              );
            }
            return null;
          })}
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <HxuiButton>
              <InfoIcon />
            </HxuiButton>
          </TooltipTrigger>
          <TooltipContent>
            Lorem ipsum dolor sit, amet consectetur adipisicing elit. At,
            dignissimos.
          </TooltipContent>
        </Tooltip>
      </HxuiButtonGroup>
      <PopoverContent className="w-100">
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="new-candidate-name">Name</FieldLabel>
            <InputGroup>
              <InputGroupInput
                value={newCandidateMeta.name}
                onChange={(e) =>
                  setNewCandidateMeta((prev) => ({
                    ...prev,
                    name: e.target.value,
                  }))
                }
                maxLength={32}
                type="text"
                placeholder="New component"
                id="new-candidate-name"
              />
              <InputGroupAddon align="inline-end">
                <InputGroupText>
                  {32 - newCandidateMeta.name.length}{" "}
                </InputGroupText>
              </InputGroupAddon>
            </InputGroup>
            <FieldDescription>
              Name of the candidate component.
            </FieldDescription>
          </Field>
          <Field>
            <FieldLabel htmlFor="new-candidate-description">
              Description
            </FieldLabel>
            <InputGroup>
              <InputGroupTextarea
                value={newCandidateMeta.description}
                onChange={(e) =>
                  setNewCandidateMeta((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                maxLength={280}
                id="new-candidate-description"
              />
              <InputGroupAddon align="block-end">
                <InputGroupText>
                  {280 - newCandidateMeta.description.length} characters left
                </InputGroupText>
              </InputGroupAddon>
            </InputGroup>
            <FieldDescription>
              Description of the candidate component. Voters will see this when
              voting for candidates. Make it as descriptive and persuasive as
              possible to increase the chances of voters voting for this
              candidate.
            </FieldDescription>
          </Field>
          <Field orientation="horizontal">
            <Switch
              id="is-new-candidate-claimable"
              checked={newCandidateMeta.claimableIfWinner}
              onClick={() =>
                setNewCandidateMeta((prev) => ({
                  ...prev,
                  claimableIfWinner: !prev.claimableIfWinner,
                }))
              }
            />
            <FieldContent>
              <FieldLabel htmlFor="is-new-candidate-claimable">
                Avail claimable offer.
              </FieldLabel>
              <FieldDescription>
                If enabled, voters can claim 50% of tokens spent on voting this
                candidate if this candidate wins. This can be used to create
                voting pressure for this component. This offer can be availed
                later as well by the admin.
              </FieldDescription>
            </FieldContent>
          </Field>
          <Field>
            <HxuiButton
              disabled={
                newCandidateMeta.name.length == 0 ||
                newCandidateMeta.description.length == 0
              }
              onClick={createCandidate}
            >
              Create Candidate
            </HxuiButton>
          </Field>
        </FieldGroup>
      </PopoverContent>
    </Popover>
  );
}

export { CreateCandidate };
