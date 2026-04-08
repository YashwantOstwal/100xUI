// "use client";
// import {
//   Popover,
//   PopoverContent,
//   PopoverTrigger,
// } from "@/components/ui/popover";
// import {
//   Field,
//   FieldGroup,
//   FieldDescription,
//   FieldLabel,
//   FieldContent,
//   FieldError,
//   FieldLegend,
// } from "@/components/ui/field";
// import {
//   ChevronDownIcon,
//   ClipboardPasteIcon,
//   InfoIcon,
//   XIcon,
// } from "lucide-react";
// import {
//   InputGroup,
//   InputGroupAddon,
//   InputGroupButton,
//   InputGroupInput,
//   InputGroupText,
//   InputGroupTextarea,
// } from "@/components/ui/input-group";
// import { useSolanaClient } from "@/providers/solana-client";
// import {
//   HxuiButton,
//   HxuiButtonGroup,
// } from "@/components/www/file-explorer/button";
// import { usePrivyAsSolanaWallet } from "@/providers/privy-as-solana-wallet";
// import {
//   address,
//   appendTransactionMessageInstruction,
//   compileTransaction,
//   createNoopSigner,
//   createTransactionMessage,
//   getTransactionEncoder,
//   pipe,
//   setTransactionMessageFeePayerSigner,
//   setTransactionMessageLifetimeUsingBlockhash,
//   getBase58Decoder,
//   isAddress,
// } from "@solana/kit";
// import { Spinner } from "@/components/ui/spinner";
// import {
//   Tooltip,
//   TooltipContent,
//   TooltipTrigger,
// } from "@/components/ui/tooltip";
// import { useEffect, useState } from "react";
// import { Switch } from "@/components/ui/switch";
// import {
//   getUpdateConfigInstructionAsync,
//   getVoteReceiptSize,
// } from "@/clients/generated/hxui";
// import { useProgramAccounts } from "../providers/program-accounts";
// import { run, truncateAddress } from "@/utils";
// import { toast } from "sonner";
// import { SolanaExplorerFull } from "@/icons/solana-explorer.icon";
// import { Input } from "@/components/ui/input";
// import { LAMPORTS_PER_SOL } from "@/clients/constants";

// const DEFAULT_NEW_CONFIG: NewConfig = {
//   newAdmin: {
//     isNullable: false,
//     value: undefined,
//     error: null,
//   },
//   newPricePerToken: {
//     isNullable: false,
//     value: undefined,
//     error: null,
//   },
//   newTokensPerVote: {
//     isNullable: false,
//     value: undefined,
//     error: null,
//   },
// };

// type NewConfigField<T> =
//   | { isNullable: true }
//   | {
//       isNullable: false;
//       value: T | undefined; // undefined initially
//       error: string | null;
//     };
// interface NewConfig {
//   newAdmin: NewConfigField<string>;
//   newPricePerToken: NewConfigField<number>;
//   newTokensPerVote: NewConfigField<number>;
// }
// export function UpdateConfig() {
//   const client = useSolanaClient();
//   const { selectedWallet, signAndSendTransaction } = usePrivyAsSolanaWallet();

//   const programAccounts = useProgramAccounts();
//   const [newConfig, setNewConfig] = useState<NewConfig>(DEFAULT_NEW_CONFIG);
//   const [minimumPricePerToken, setMinimumPricePerToken] = useState<
//     number | undefined
//   >(undefined);
//   async function updateConfig() {
//     if (!selectedWallet)
//       return console.error(
//         "wallet not connected. please connect with your admin wallet to create a candidate"
//       );

//     if (programAccounts.isLoading)
//       return console.error(
//         "program accounts are loading. please wait and try again"
//       );
//     const selectedWalletAddress = address(selectedWallet.address);
//     if (programAccounts.hxuiConfig.data.admin !== selectedWalletAddress)
//       return console.error("only admin can invoke this instruction.");

//     // if (
//     //   newCandidateMeta.name.length === 0 ||
//     //   newCandidateMeta.description.length === 0
//     // ) {
//     //   return console.error("name and description are required");
//     // }
//     const adminSigner = createNoopSigner(selectedWalletAddress);

//     // const createCandidateIx = await getUpdateConfigInstructionAsync({
//     //   admin: adminSigner,
//     //   ...newCandidateMeta,
//     // });
//     const { value: latestBlockhash } = await client.rpc
//       .getLatestBlockhash()
//       .send();
//     const compiledAndEncodedTx = pipe(
//       createTransactionMessage({ version: 0 }),
//       (tx) => setTransactionMessageFeePayerSigner(adminSigner, tx),
//       (tx) => setTransactionMessageLifetimeUsingBlockhash(latestBlockhash, tx),
//       //   (tx) => appendTransactionMessageInstruction(createCandidateIx, tx),
//       (tx) => compileTransaction(tx),
//       (tx) => new Uint8Array(getTransactionEncoder().encode(tx))
//     );

//     toast.promise(
//       signAndSendTransaction({
//         transaction: compiledAndEncodedTx,
//         wallet: selectedWallet,
//         options: { commitment: "confirmed" },
//       }),
//       {
//         loading: "Pending...",
//         success: async ({ signature }) => {
//           return (
//             <a
//               target="_blank"
//               rel="noopener noreferrer"
//               className=""
//               href={`https://explorer.solana.com/tx/${getBase58Decoder().decode(signature)}?cluster=devnet`}
//             >
//               <div className="flex items-center gap-1 text-nowrap">
//                 Transaction confirmed. View on
//                 <SolanaExplorerFull className="w-30" />
//               </div>
//             </a>
//           );
//         },
//         error: (err) => {
//           console.error(err);
//           if (err?.message?.includes("rejected"))
//             return "Transaction rejected.";
//           return "Transaction failed to execute. Check the logs.";
//         },
//       }
//     );
//   }

//   async function getNewMinimumPricePerToken(tokensPerVote: bigint) {
//     const voteReceiptRent = await client.rpc
//       .getMinimumBalanceForRentExemption(BigInt(getVoteReceiptSize()))
//       .send();

//     const newMinimumPricePerToken = Math.ceil(
//       Number(voteReceiptRent / tokensPerVote)
//     );
//     return newMinimumPricePerToken;

//     // setMinimumPricePerToken(newMinPricePerToken);
//     // if (newConfig.newPricePerToken.isNullable === false) {
//     //   if (
//     //     newConfig.newPricePerToken.value !== undefined &&
//     //     newConfig.newPricePerToken.value < newMinPricePerToken
//     //   ) {
//     //     setNewConfig((prev) => ({
//     //       ...prev,
//     //       newPricePerToken: {
//     //         ...prev.newPricePerToken,

//     //         error: `The Price per token must be >= ${newMinPricePerToken}`,
//     //       },
//     //     }));
//     //   }
//     // } else {
//     //   setNewConfig((prev) => ({
//     //     ...prev,
//     //     newPricePerToken: DEFAULT_NEW_CONFIG.newPricePerToken,
//     //   }));
//     // }
//   }
//   useEffect(() => {
//     if (programAccounts.isLoading) return;
//     run(async () => {
//       const newMinimumPricePertoken = await getNewMinimumPricePerToken(
//         programAccounts.hxuiConfig.data.tokensPerVote
//       );
//       setMinimumPricePerToken(newMinimumPricePertoken);
//     });
//   }, [programAccounts]);
//   const disabled =
//     !selectedWallet ||
//     programAccounts.isLoading ||
//     selectedWallet.address !== programAccounts.hxuiConfig.data.admin;
//   return (
//     <Popover>
//       <HxuiButtonGroup>
//         <Tooltip>
//           <TooltipTrigger asChild>
//             <span>
//               <PopoverTrigger asChild disabled={disabled}>
//                 <HxuiButton>
//                   Update HxUI Config
//                   {programAccounts.isLoading ? (
//                     <Spinner className="size-4" />
//                   ) : (
//                     <ChevronDownIcon className="size-4" />
//                   )}
//                 </HxuiButton>
//               </PopoverTrigger>
//             </span>
//           </TooltipTrigger>
//           {run(() => {
//             if (!selectedWallet) {
//               return (
//                 <TooltipContent>
//                   Please connect to a Solana wallet
//                 </TooltipContent>
//               );
//             }
//             if (programAccounts.isLoading) {
//               return null;
//             }

//             if (
//               selectedWallet.address != programAccounts.hxuiConfig.data.admin
//             ) {
//               return (
//                 <TooltipContent>
//                   Only admin can invoke this instruction.
//                 </TooltipContent>
//               );
//             }
//             return null;
//           })}
//         </Tooltip>
//         <Tooltip>
//           <TooltipTrigger asChild>
//             <HxuiButton>
//               <InfoIcon />
//             </HxuiButton>
//           </TooltipTrigger>
//           <TooltipContent>
//             Lorem ipsum dolor sit amet consectetur adipisicing elit. Commodi,
//             nihil.
//           </TooltipContent>
//         </Tooltip>
//       </HxuiButtonGroup>
//       {!disabled && (
//         <PopoverContent className="w-100">
//           <FieldGroup>
//             <Field
//               data-invalid={
//                 newConfig.newAdmin.isNullable === false &&
//                 !!newConfig.newAdmin.error
//               }
//             >
//               <FieldLegend>
//                 <div className="flex items-center gap-2">
//                   <FieldLabel htmlFor="new-admin">New admin address</FieldLabel>
//                   <Switch
//                     size="sm"
//                     checked={newConfig.newAdmin.isNullable === false}
//                     onClick={() =>
//                       setNewConfig((prev) => {
//                         if (prev.newAdmin.isNullable) {
//                           return {
//                             ...prev,
//                             newAdmin: DEFAULT_NEW_CONFIG.newAdmin,
//                           };
//                         }
//                         return { ...prev, newAdmin: { isNullable: true } };
//                       })
//                     }
//                   />
//                 </div>
//                 <FieldDescription>
//                   Current admin:&nbsp;
//                   <span className="font-mono">
//                     {truncateAddress(programAccounts.hxuiConfig.data.admin)}
//                   </span>
//                 </FieldDescription>
//               </FieldLegend>

//               {newConfig.newAdmin.isNullable === false && (
//                 <>
//                   <InputGroup>
//                     <InputGroupInput
//                       aria-invalid={newConfig.newAdmin.error != null}
//                       value={newConfig.newAdmin.value}
//                       onChange={(e) => {
//                         const newAdmin = e.target.value;
//                         let error: string | null = null;
//                         if (isAddress(newAdmin)) {
//                           if (
//                             newAdmin == programAccounts.hxuiConfig.data.admin
//                           ) {
//                             error =
//                               "The provided address is already the admin.";
//                           }
//                         } else {
//                           error = "Not a valid solana address";
//                         }
//                         setNewConfig((prev) => ({
//                           ...prev,
//                           newAdmin: {
//                             ...prev.newAdmin,
//                             value: newAdmin,
//                             error,
//                           },
//                         }));
//                       }}
//                       type="text"
//                       placeholder="Enter the new admin address"
//                       id="new-admin"
//                     />
//                     {/* <InputGroupAddon align="inline-end">
//                   <InputGroupButton
//                   onClick={async () => {
//                     const copiedAddress =
//                     await navigator.clipboard.readText();
//                     setNewConfig((prev) => ({
//                       ...prev,
//                       newAdmin: {
//                         ...prev.newAdmin,
//                         value: copiedAddress,
//                           error: isAddress(copiedAddress)
//                           ? null
//                           : "Not a valid solana address",
//                           },
//                           }));
//                           }}
//                           size="icon-xs"
//                     variant="ghost"
//                   >
//                     <ClipboardPasteIcon></ClipboardPasteIcon>
//                   </InputGroupButton>
//                   <InputGroupButton
//                     onClick={() => {
//                       setNewConfig((prev) => ({
//                         ...prev,
//                         newAdmin: {
//                           ...prev.newAdmin,
//                           value: "",
//                           error: "Not a valid solana address",
//                         },
//                       }));
//                     }}
//                     size="icon-xs"
//                     variant="ghost"
//                   >
//                     <XIcon></XIcon>
//                     </InputGroupButton>
//                     </InputGroupAddon> */}
//                   </InputGroup>
//                   <FieldContent>
//                     <FieldDescription>
//                       New Admin that can perform admin actions.
//                     </FieldDescription>
//                     {newConfig.newAdmin.error && (
//                       <FieldError>{newConfig.newAdmin.error}</FieldError>
//                     )}
//                   </FieldContent>
//                 </>
//               )}
//             </Field>
//             <Field
//               data-invalid={
//                 newConfig.newTokensPerVote.isNullable === false &&
//                 !!newConfig.newTokensPerVote.error
//               }
//             >
//               <FieldLegend>
//                 <div className="flex items-center gap-2">
//                   <FieldLabel htmlFor="new-tokens-per-vote">
//                     New tokens per vote
//                   </FieldLabel>
//                   <Switch
//                     size="sm"
//                     checked={newConfig.newTokensPerVote.isNullable === false}
//                     onChange={async (e) => {
//                       const newMinimumPricePerToken =
//                         await getNewMinimumPricePerToken(
//                           programAccounts.hxuiConfig.data.tokensPerVote
//                         );
//                       setMinimumPricePerToken(newMinimumPricePerToken);
//                       setNewConfig((prev) => {
//                         if (prev.newTokensPerVote.isNullable) {
//                           return {
//                             ...prev,
//                             newTokensPerVote:
//                               DEFAULT_NEW_CONFIG.newTokensPerVote,
//                           };
//                         }

//                         if (
//                           prev.newPricePerToken.isNullable === false &&
//                           prev.newPricePerToken.value
//                         ) {
//                           return {
//                             ...prev,
//                             newTokensPerVote: { isNullable: true },
//                             newPricePerToken: {
//                               ...prev.newPricePerToken,
//                               error:
//                                 prev.newPricePerToken.value <
//                                 newMinimumPricePerToken
//                                   ? `Error.`
//                                   : null,
//                             },
//                           };
//                         }
//                         return {
//                           ...prev,
//                           newTokensPerVote: { isNullable: true },
//                         };
//                       });
//                     }}
//                   />
//                 </div>
//                 <FieldDescription>
//                   Current tokens per vote:{" "}
//                   {programAccounts.hxuiConfig.data.tokensPerVote}
//                 </FieldDescription>
//               </FieldLegend>

//               {newConfig.newTokensPerVote.isNullable === false && (
//                 <>
//                   <InputGroup>
//                     <InputGroupInput
//                       aria-invalid={newConfig.newTokensPerVote.error != null}
//                       value={newConfig.newTokensPerVote.value}
//                       onChange={async (e) => {
//                         const newTokensPerVote = parseInt(e.target.value);
//                         let newTokensPerVoteError: string | null = null;
//                         if (newTokensPerVote < 1) {
//                           return setNewConfig((prev) => ({
//                             ...prev,
//                             newTokensPerVote: {
//                               ...prev.newTokensPerVote,
//                               value: newTokensPerVote,
//                               error: "tokens per vote must be >= 1",
//                             },
//                           }));
//                         } else if (
//                           newTokensPerVote ==
//                           Number(programAccounts.hxuiConfig.data.tokensPerVote)
//                         ) {
//                           return setNewConfig((prev) => ({
//                             ...prev,
//                             newTokensPerVote: {
//                               ...prev.newTokensPerVote,
//                               value: newTokensPerVote,
//                               error:
//                                 "Provided value is already the current tokens per vote",
//                             },
//                           }));
//                         }

//                         // if the input is valid.
//                         const newMinimumPricePerToken =
//                           await getNewMinimumPricePerToken(
//                             BigInt(newTokensPerVote)
//                           );
//                         setMinimumPricePerToken(newMinimumPricePerToken);

//                         setNewConfig((prev) => {
//                           if (
//                             prev.newPricePerToken.isNullable === false &&
//                             prev.newPricePerToken.value
//                           ) {
//                             return {
//                               ...prev,
//                               newTokensPerVote: {
//                                 ...prev.newTokensPerVote,
//                                 value: newTokensPerVote,
//                                 error: null,
//                               },
//                               newPricePerToken: {
//                                 ...prev.newPricePerToken,
//                                 error:
//                                   prev.newPricePerToken.value <
//                                   newMinimumPricePerToken
//                                     ? `Error.`
//                                     : null,
//                               },
//                             };
//                           }
//                           return {
//                             ...prev,
//                             newTokensPerVote: {
//                               ...prev.newTokensPerVote,
//                               value: newTokensPerVote,
//                               error: null,
//                             },
//                           };
//                         });
//                       }}
//                       type="number"
//                       min={1}
//                       placeholder="Enter the new tokens per vote"
//                       id="new-tokens-per-vote"
//                     />
//                   </InputGroup>
//                   <FieldDescription>
//                     Lorem ipsum dolor sit amet consectetur adipisicing elit.
//                     Laboriosam, fugit?
//                   </FieldDescription>
//                   {newConfig.newTokensPerVote.error && (
//                     <div className="text-destructive text-xs">
//                       {newConfig.newTokensPerVote.error}
//                     </div>
//                   )}
//                 </>
//               )}
//             </Field>
//             <Field
//               data-invalid={
//                 newConfig.newPricePerToken.isNullable === false &&
//                 !!newConfig.newPricePerToken.error
//               }
//             >
//               <FieldLegend>
//                 <div className="flex items-center gap-2">
//                   <FieldLabel htmlFor="new-price-per-token">
//                     New price per HxUI token
//                   </FieldLabel>
//                   <Switch
//                     size="sm"
//                     checked={
//                       newConfig.newPricePerToken.isNullable === false ||
//                       (minimumPricePerToken !== undefined &&
//                         programAccounts.hxuiConfig.data.pricePerToken <
//                           minimumPricePerToken)
//                     }
//                     onClick={() =>
//                       setNewConfig((prev) => {
//                         if (prev.newPricePerToken.isNullable) {
//                           return {
//                             ...prev,
//                             newPricePerToken:
//                               DEFAULT_NEW_CONFIG.newPricePerToken,
//                           };
//                         }
//                         return {
//                           ...prev,
//                           newPricePerToken: { isNullable: true },
//                         };
//                       })
//                     }
//                   />
//                 </div>
//                 <FieldDescription>
//                   Current price per token:{" "}
//                   {Number(programAccounts.hxuiConfig.data.pricePerToken) /
//                     LAMPORTS_PER_SOL}
//                 </FieldDescription>
//               </FieldLegend>
//               {newConfig.newPricePerToken.isNullable === false && (
//                 <>
//                   <InputGroup>
//                     <InputGroupInput
//                       aria-invalid={newConfig.newPricePerToken.error != null}
//                       value={newConfig.newPricePerToken.value}
//                       onChange={async (e) => {
//                         if (minimumPricePerToken === undefined) return;
//                         const newPricePerToken = parseInt(e.target.value);
//                         let error: string | null = null;
//                         if (newPricePerToken < minimumPricePerToken) {
//                           error = `The Price per token must be >= ${minimumPricePerToken}`;
//                         }
//                         setNewConfig((prev) => ({
//                           ...prev,
//                           newPricePerToken: {
//                             ...prev.newPricePerToken,
//                             value: newPricePerToken,
//                             error,
//                           },
//                         }));
//                       }}
//                       min={minimumPricePerToken}
//                       type="number"
//                       placeholder="New price per token"
//                       id="new-price-per-token"
//                     />
//                   </InputGroup>
//                   <FieldDescription>
//                     Lorem ipsum dolor sit amet consectetur adipisicing elit.
//                     Laboriosam, fugit?
//                   </FieldDescription>
//                   {newConfig.newPricePerToken.error && (
//                     <div className="text-destructive text-xs">
//                       {newConfig.newPricePerToken.error}
//                     </div>
//                   )}
//                 </>
//               )}
//             </Field>

//             <Field>
//               <HxuiButton
//                 //   disabled={
//                 //   }
//                 onClick={updateConfig}
//               >
//                 Update HxUI config
//               </HxuiButton>
//             </Field>
//           </FieldGroup>
//         </PopoverContent>
//       )}
//     </Popover>
//   );
// }
