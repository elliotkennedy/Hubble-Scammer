import React from "react";
import { Button, Select } from "antd";
import { ENDPOINTS } from "../../services/web3/client";
import useEnv from "../../hooks/useEnv";

export const Settings = () => {

  const { env, setEnv, walletConnected, disconnectWallet } = useEnv();

  return (
    <>
      <div style={{ display: "grid" }}>
        Network:{" "}
        <Select
          onSelect={setEnv}
          value={env}
          style={{ marginBottom: 20 }}
        >
          {ENDPOINTS.map(({ name }) => (
            <Select.Option value={name} key={name}>
              {name}
            </Select.Option>
          ))}
        </Select>
        {walletConnected && (
          <Button type="primary" onClick={disconnectWallet}>
            Disconnect
          </Button>
        )}
      </div>
    </>
  );
};
