import React, { useState } from "react";
import { Modal } from "antd";
import { ButtonProps } from "antd/lib/button";
import { CreateVaultButton } from "../CreateVaultButton/CreateVaultButton";

export interface CreateVaultModalProps extends ButtonProps, React.RefAttributes<HTMLElement> {
  handleCreateNewVault: (e: React.MouseEvent<HTMLElement>) => void
}

export const CreateVaultModal = ({handleCreateNewVault, ...props}: CreateVaultModalProps) => {

  const [isModalVisible, setIsModalVisible] = useState(false);

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  return (
    <>
      <CreateVaultButton {...props} onClick={showModal} />
      <Modal
        title="Create new vault"
        visible={isModalVisible}
        onOk={handleCreateNewVault}
        onCancel={handleCancel}
      >
        <p>Some contents...</p>
        <p>Some contents...</p>
        <p>Some contents...</p>
      </Modal>
    </>
  );
};
