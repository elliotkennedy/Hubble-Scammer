import React, { useCallback } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { Button } from "antd";
import { ButtonProps } from "antd/lib/button";
import {PlusOutlined} from "@ant-design/icons";
import { LABELS } from "../../constants";

export interface CreateVaultButtonProps extends ButtonProps, React.RefAttributes<HTMLElement> {
}

export const CreateVaultButton = (props: CreateVaultButtonProps) => {

  const { connected } = useWallet();
  const { onClick, disabled, ...rest } = props;

  const handleChangeWalletButtonClick: React.MouseEventHandler<HTMLElement> = useCallback(
    (event) => {
      if (connected) {
        onClick?.(event);
        
      }
    },
    [onClick, connected]
  );

  return (
    <Button
      {...rest}
      onClick={handleChangeWalletButtonClick}
      disabled={connected && disabled}
      icon={<PlusOutlined />}
    >
      {LABELS.CREATE_VAULT_ACTION}
    </Button>
  );
};
