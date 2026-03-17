"use client";

import { useProgramAccounts } from "@/app/(navbar)/vote-component/providers/program-accounts";
import { fetchConfig, HXUI_PROGRAM_ADDRESS } from "@/clients/generated/hxui";
import { getHxuiConfigAddress } from "@/clients/pdas";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import { Switch } from "@/components/ui/switch";
import { useIsAdminView } from "@/providers/is-admin-view";
import { usePrivyAsSolanaWallet } from "@/providers/privy-as-solana-wallet";

import { useSolanaClient } from "@/providers/solana-client";
import { run } from "@/utils";
import { getProgramDerivedAddress } from "@solana/kit";
import { useEffect, useState } from "react";
import { HxuiButtonGroup } from "./button";

export function IsAdminViewToggle() {
  const client = useSolanaClient();
  const [showAdminViewToggle, setShowAdminViewToggle] = useState(false);
  const { selectedWallet } = usePrivyAsSolanaWallet();
  const { isAdminView, setIsAdminView } = useIsAdminView();
  const programAccounts = useProgramAccounts();

  useEffect(() => {
    run(async () => {
      if (!selectedWallet) return;
      if (programAccounts.isLoading) {
        return;
      }
      setShowAdminViewToggle(
        programAccounts.hxuiConfig.data.admin === selectedWallet.address
      );
      setIsAdminView(
        programAccounts.hxuiConfig.data.admin == selectedWallet.address
      );
    });
  }, [selectedWallet?.address, programAccounts]);

  if (showAdminViewToggle) {
    return (
      <Field orientation="horizontal" className="mr-0.5 gap-1.5">
        <FieldLabel htmlFor="admin-view-toggle" className="leading-none">
          Admin view?
        </FieldLabel>
        <Switch
          id="admin-view-toggle"
          checked={isAdminView}
          onClick={() => setIsAdminView((prev) => !prev)}
        />
      </Field>
    );
  }
  return null;
}
