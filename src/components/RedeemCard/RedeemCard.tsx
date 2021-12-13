import "./RedeemCard.less";
import { Col, Row, Typography, } from "antd";

export const RedeemCard = (props: {
    text: string;
    price: string;
    coin: string;
    market: string;
}) => {
    return (
        <div className="redeemcard">
            <Row style={{ display: "flex", alignItems: "center", marginLeft: "10px" }}>
                <Col span={6} style={{ textAlign: "left" }}>
                    <img alt="BTC" src="https://img.icons8.com/office/30/000000/bitcoin.png" />
                    <Typography.Text style={{ marginLeft: "10px" }} strong >{props.text}</Typography.Text>
                </Col>
                <Col span={6}>
                    <Typography.Text strong >{props.price}</Typography.Text>
                </Col>
                <Col span={6}>
                    <Typography.Text strong >{props.coin}</Typography.Text>
                </Col>
                <Col span={6}>
                    <Typography.Text strong >{props.market}</Typography.Text>
                </Col>
            </Row>
        </div>
    );
};
