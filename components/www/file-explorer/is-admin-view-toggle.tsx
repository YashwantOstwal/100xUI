"use client";

import { useProgramAccounts } from "@/app/(navbar)/vote-component/providers/program-accounts";
import { Field, FieldLabel } from "@/components/ui/field";
import { Switch } from "@/components/ui/switch";
import { useIsAdminView } from "@/providers/is-admin-view";
import { usePrivyAsSolanaWallet } from "@/providers/privy-as-solana-wallet";

import { run } from "@/utils";
import { useEffect, useState } from "react";

export function IsAdminViewToggle() {
  const [showAdminViewToggle, setShowAdminViewToggle] = useState(false);
  const { selectedWallet } = usePrivyAsSolanaWallet();
  const { isAdminView, setIsAdminView } = useIsAdminView();
  const programAccounts = useProgramAccounts();

  useEffect(() => {
    run(async () => {
      if (!selectedWallet) {
        setIsAdminView(false);
        setShowAdminViewToggle(false);
        return;
      }
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
  }, [selectedWallet, setIsAdminView, programAccounts]);

  if (showAdminViewToggle) {
    return (
      <Field orientation="horizontal" className="gap-1.5">
        <FieldLabel
          htmlFor="admin-view-toggle"
          className="text-right leading-none"
        >
          Admin view ?
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
