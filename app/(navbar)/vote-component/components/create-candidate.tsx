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
import {
  HxuiButton,
  HxuiButtonGroup,
} from "@/components/www/file-explorer/button";
import { usePrivyAsSolanaWallet } from "@/providers/privy-as-solana-wallet";
import {
  address,
  appendTransactionMessageInstruction,
  compileTransaction,
  createNoopSigner,
  createTransactionMessage,
  getTransactionEncoder,
  pipe,
  setTransactionMessageFeePayerSigner,
  setTransactionMessageLifetimeUsingBlockhash,
  getBase58Decoder,
} from "@solana/kit";
import { getCandidateAddress } from "@/clients/pdas";
import { Spinner } from "@/components/ui/spinner";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useState } from "react";
import { Switch } from "@/components/ui/switch";
import {
  fetchHxuiCandidate,
  // fetchMaybeHxuiCandidate,
  getCreateCandidateInstructionAsync,
} from "@/clients/generated/hxui";
import { useProgramAccounts } from "../providers/program-accounts";
import { useCandidatesContext } from "../providers/candidates";
import { run } from "@/utils";
import { toast } from "sonner";
import { SolanaExplorerFull } from "@/icons/solana-explorer.icon";
import { Input } from "@/components/ui/input";

const DEFAULT_CANDIDATE_META = {
  name: "",
  description: "",
  enableClaimBackOffer: false,
};
function CreateCandidate() {
  const client = useSolanaClient();
  const { selectedWallet, signAndSendTransaction } = usePrivyAsSolanaWallet();
  const candidatesContext = useCandidatesContext();

  const [newCandidateMeta, setNewCandidateMeta] = useState<
    typeof DEFAULT_CANDIDATE_META
  >(DEFAULT_CANDIDATE_META);
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
      return console.error("only admin can invoke this instruction.");

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
    const compiledAndEncodedTx = pipe(
      createTransactionMessage({ version: 0 }),
      (tx) => setTransactionMessageFeePayerSigner(adminSigner, tx),
      (tx) => setTransactionMessageLifetimeUsingBlockhash(latestBlockhash, tx),
      (tx) => appendTransactionMessageInstruction(createCandidateIx, tx),
      (tx) => compileTransaction(tx),
      (tx) => new Uint8Array(getTransactionEncoder().encode(tx))
    );

    toast.promise(
      signAndSendTransaction({
        transaction: compiledAndEncodedTx,
        wallet: selectedWallet,
        options: { commitment: "confirmed" },
      }),
      {
        loading: "Pending...",
        success: async ({ signature }) => {
          setNewCandidateMeta(DEFAULT_CANDIDATE_META);
          if (candidatesContext.isLoading) return;
          const newCandidateAddress = await getCandidateAddress({
            candidateName: newCandidateMeta.name,
          });

          // TODO: poll every 500 with fetchMaybeHxuiCandidate.
          setTimeout(async () => {
            // try {
            const newCandidate = await fetchHxuiCandidate(
              client.rpc,
              newCandidateAddress
            );
            candidatesContext.setCandidates((prev) => {
              return [...prev, newCandidate].sort(
                (a, b) => b.data.id - a.data.id
              );
            });
            // } catch (err) {
            // console.error(err);
            // }
          }, 1200);
          return (
            <a
              target="_blank"
              rel="noopener noreferrer"
              className=""
              href={`https://explorer.solana.com/tx/${getBase58Decoder().decode(signature)}?cluster=devnet`}
            >
              <div className="flex items-center gap-1 text-nowrap">
                Transaction confirmed. View on
                <SolanaExplorerFull className="w-30" />
              </div>
            </a>
          );
        },
        error: (err) => {
          console.error(err);
          if (err?.message?.includes("rejected"))
            return "Transaction rejected.";
          return "Transaction failed to execute. Check the logs.";
        },
        // finally: async () => {},
      }
    );
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
                  Create a candidate
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
                  Please connect to a Solana wallet
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
                  Only admin can invoke this instruction.
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
            Create a new candidate with component metadata for users to vote
            using HxUI or HxUI Lite tokens.
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
            <FieldLabel htmlFor="new-candidate-media">Media</FieldLabel>
            <Input
              value={newCandidateMeta.name
                .toLocaleLowerCase()
                .replaceAll(" ", "-")}
              disabled
              placeholder="new-component"
              id="new-candidate-media"
            />
            <FieldDescription>
              Ensure the media in the public directory.
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
              checked={newCandidateMeta.enableClaimBackOffer}
              onClick={() =>
                setNewCandidateMeta((prev) => ({
                  ...prev,
                  enableClaimBackOffer: !prev.enableClaimBackOffer,
                }))
              }
            />
            <FieldContent>
              <FieldLabel htmlFor="is-new-candidate-claimable">
                Enable claim-back offer.
              </FieldLabel>
              <FieldDescription>
                Enable users to reclaim 50% of HxUI tokens spent if the
                candidate is later selected as a winner. This offer can be
                enabled later as well.
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
