import { Typography, Col, Row } from "antd";
import btc from '../../assets/bitcoin.png';
import eth from '../../assets/eth.png';
import ftt from '../../assets/ftt.png';
import sol from '../../assets/solana.png';
import ray from '../../assets/ray.png';
import hbb from '../../assets/hbb.png';
import srm from '../../assets/srm.png';
import usdh from '../../assets/usdh.png';
import { Token } from "../../constants";

export interface StabilityReward {
    token: Token;
    amount: number;
    value: number;
}

export const StabilityList = (props: {
    topic: string,
    aprs: Array<StabilityReward>,
}) => {
    return (
        <div
            className="ant-card-body stabilitycard"
            style={{
                padding: 16,
                backgroundColor: "#2F3A4A",
                border: 0,
                borderRadius: 20,
                borderStyle: "solid",
                borderColor: "#8F8F8F"
            }}
        >
            <Typography.Text strong>{props.topic}</Typography.Text>
            <hr className="hr-stability-list" style={{
                backgroundColor: "#4C5A6D",
                opacity: 0.3
            }} />
            <div style={{ display: "flex", justifyContent: "space-between" }}>
                <Row style={{ textAlign: "left" }}>
                    <Col span={8}>
                        <Typography.Text type="secondary">Reward</Typography.Text>
                    </Col>
                    <Col span={10}>
                        <Typography.Text type="secondary">Amount</Typography.Text>
                    </Col>
                    <Col span={6}>
                        <Typography.Text type="secondary">Value</Typography.Text>
                    </Col>
                </Row>
            </div>
            {
                props.aprs.map((each: any) => {
                    return (
                        <Row key={each.token} style={{ marginTop: "10px", textAlign: "left", fontSize: "12px" }} className="font-middle item-center">
                            <Col span={8}>
                                {each.token === "USDH" ? <img width={25} height={25} style={{ borderRadius: 50 }} src={usdh} alt="" /> : null}
                                {each.token === "HBB" ? <img width={25} height={25} style={{ borderRadius: 50 }} src={hbb} alt="" /> : null}
                                {each.token === "SOL" ? <img width={25} height={25} style={{ borderRadius: 50 }} src={sol} alt="" /> : null}
                                {each.token === "BTC" ? <img width={25} height={25} style={{ borderRadius: 50 }} src={btc} alt="" /> : null}
                                {each.token === "ETH" ? <img width={25} height={25} style={{ borderRadius: 50 }} src={eth} alt="" /> : null}
                                {each.token === "RAY" ? <img width={25} height={25} style={{ borderRadius: 50 }} src={ray} alt="" /> : null}
                                {each.token === "FTT" ? <img width={25} height={25} style={{ borderRadius: 50 }} src={ftt} alt="" /> : null}
                                {each.token === "SRM" ? <img width={25} height={25} style={{ borderRadius: 50 }} src={srm} alt="" /> : null}
                                <Typography.Text style={{ marginLeft: "10px" }} >{each.token}</Typography.Text>
                            </Col>
                            <Col span={10}>
                                <Typography.Text>{Math.max(0, each.amount)}</Typography.Text>
                            </Col>
                            <Col span={6}>
                                <Typography.Text>${format(Math.max(0, each.value))}</Typography.Text>
                            </Col>
                        </Row>
                    )
                })
            }
        </div>
    );
};

function format(num: number): string {
    return parseFloat((num).toFixed(5)).toLocaleString().replace(/\.([0-9])$/, ".$10")
}
