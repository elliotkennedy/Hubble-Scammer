import React from "react";
import { FarmContainer } from "../../components/FarmContainer/FarmContainer";
import PageTitle  from "../../components/PageTitle/PageTitle";
import "./Farms.less";


const Farms = () => {

  return (
    <div
      style={{
        flexGrow: 1,
        width: '100%',
        marginTop: 50,
        textAlign: "left"
      }}
    >
      <PageTitle
        title="Farm with Hubble"
        description="Take loans backed by your entire PORTFOLIO, up to a 110% collateral ratio. Your collateral earns yield and repays your debt. Top up your collateral, borrow more and diversify your portfolio to protect against market drops."
      />

      <div className="item-center justify-center" style={{ marginTop: "50px" }}>
        <FarmContainer topic="Stake HBB" description="8.20% APY" price="$458,097,567.977 TVL" item={["HBB"]} buttonname="Stake HBB" rewardtype />
        <div style={{ marginLeft: "30px" }} />
        <FarmContainer topic="Stake USDH" description="1.92% APY" price="$528,097,567.977 TVL" item={["USDH"]} buttonname="Stake USDH" rewardtype />
      </div>

      <div className="item-center justify-center" style={{ marginTop: "30px" }}>
        <FarmContainer topic="Stake USDH/USDC" description="3.25% APY" price="$856,097,567.977 TVL" item={["USDH", "USDC"]} buttonname="Stake" rewardtype={false} />
        <div style={{ marginLeft: "30px" }} />
        <FarmContainer topic="Stake USDC/HBB" description="4.2% APY" price="$198,097,567.977 TVL" item={["HBB", "USDC"]} buttonname="Stake" rewardtype={false} />
      </div>
    </div>
  );
};


export default Farms;
