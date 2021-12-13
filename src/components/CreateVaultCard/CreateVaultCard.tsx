import React from "react";
import {Card, Typography} from "antd";
import {LABELS} from "../../constants";
import {CreateVaultModal} from "../CreateVaultModal/CreateVaultModal";

const {Title} = Typography;

export interface CreateVaultCardProps {
  handleCreateNewVault: (e: React.MouseEvent<HTMLElement>) => void
}

export const CreateVaultCard = ({handleCreateNewVault}: CreateVaultCardProps) => {

  return (
    <Card>
      <Card
        title={LABELS.CREATE_VAULT_TITLE}
        actions={[
          <CreateVaultModal handleCreateNewVault={handleCreateNewVault} type="primary" />
        ]}
      >
        <Title level={4}>You don&apos;t currently have any vaults</Title>
        <Title level={5} type="secondary">Create a new vault to deposit collateral into</Title>
      </Card>
    </Card>
  );
};
