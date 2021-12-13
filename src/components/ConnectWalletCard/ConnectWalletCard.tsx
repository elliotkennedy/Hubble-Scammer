import React from 'react';
import {Card, Typography} from "antd";
import {ConnectButton} from "../ConnectButton/ConnectButton";

const {Title} = Typography;

const ConnectWalletCard = ({...props}) => {
  return (
    <Card
      title="Connect Wallet"
      actions={[
        <ConnectButton />
      ]}
      {...props}
    >
      <Title level={5}>
        Connect your wallet to get started!
      </Title>
    </Card>
  );
}

export default ConnectWalletCard;
