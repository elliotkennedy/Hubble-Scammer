import { Checkbox } from "antd";
import "./FarmContainerReward.less";
import USDH from "../../assets/usdh.png";
import SOL from "../../assets/solana.png";
import BIT from "../../assets/bitcoin.png";
import SRM from "../../assets/srm.png";
import FTT from "../../assets/ftt.png";
import RAY from "../../assets/ray.png";
import ETH from "../../assets/eth.png";

export function FarmContainerReward({ rewardtype }: FarmContainerRewardProps) {

    return (
        <>
            {rewardtype ?
                <div>
                    <img src={USDH} alt="USDH" style={{ width: "24px", height: "24px", marginRight: "5px", borderRadius: "15px", marginTop: "5px" }} />
                    <img src={SOL} alt="SOL" style={{ width: "24px", height: "24px", marginRight: "5px", borderRadius: "15px", marginTop: "5px" }} />
                    <img src={BIT} alt="BIT" style={{ width: "24px", height: "24px", marginRight: "5px", borderRadius: "15px", marginTop: "5px" }} />
                    <img src={ETH} alt="ETH" style={{ width: "24px", height: "24px", marginRight: "5px", borderRadius: "15px", marginTop: "5px" }} />
                    <img src={SRM} alt="SRM" style={{ width: "24px", height: "24px", marginRight: "5px", borderRadius: "15px", marginTop: "5px" }} />
                    <img src={FTT} alt="FTT" style={{ width: "24px", height: "24px", marginRight: "5px", borderRadius: "15px", marginTop: "5px" }} />
                    <img src={RAY} alt="RAY" style={{ width: "24px", height: "24px", marginRight: "5px", borderRadius: "15px", marginTop: "5px" }} />
                </div> : <div><Checkbox style={{ marginTop: "5px" }} checked>Earn transaction frees & HBB </Checkbox></div>}
        </>
    )
}

interface FarmContainerRewardProps {
    rewardtype: boolean,
}
