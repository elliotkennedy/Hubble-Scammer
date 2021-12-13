import { Typography } from "antd";
import React from "react";
import "./ShowIcon.less";
import BTC from '../../assets/bitcoin.png';
import SOLANA from '../../assets/solana.png';
import USDC from '../../assets/usdc.png';
import USDT from '../../assets/usdt.png';
import ETH from '../../assets/eth.png';
import SRM from '../../assets/srm.png';
import FTT from '../../assets/ftt.png';
import RAY from '../../assets/ray.png';

export class ShowIcon extends React.Component<any, any> {

    render() {

        return (
            <div style={{}} className="icon-container">
                {
                    this.props.loans.map((loan: any, index: number) => {
                        if (loan === "BTC") {
                            return (
                                index === 0 ? <img src={BTC} alt="BTC" key={index} /> : <img src={BTC} alt="BTC" key={loan} style={{ marginLeft: "-5px" }} />
                            );
                        } if (loan === "SOLANA") {
                            return (
                                index === 0 ? <img src={SOLANA} alt="SOLANA" key={index} /> : <img src={SOLANA} alt="SOLANA" key={loan} style={{ marginLeft: "-5px" }} />
                            );
                        } if (loan === "USDC") {
                            return (
                                index === 0 ? <img src={USDC} alt="USDC" key={index} /> : <img src={USDC} alt="USDC" key={loan} style={{ marginLeft: "-5px" }} />
                            );
                        } if (loan === "USDT") {
                            return (
                                index === 0 ? <img src={USDT} alt="USDT" key={index} /> : <img src={USDT} alt="USDT" key={loan} style={{ marginLeft: "-5px" }} />
                            );
                        } if (loan === "ETH") {
                            return (
                                index === 0 ? <img src={ETH} alt="ETH" key={index} /> : <img src={ETH} alt="ETH" key={loan} style={{ marginLeft: "-5px" }} />
                            );
                        } if (loan === "RAY") {
                          return (
                            index === 0 ? <img src={RAY} alt="RAY" key={index} /> : <img src={RAY} alt="RAY" key={loan} style={{ marginLeft: "-5px" }} />
                          );
                        } if (loan === "FTT") {
                          return (
                            index === 0 ? <img src={FTT} alt="FTT" key={index} /> : <img src={FTT} alt="FTT" key={loan} style={{ marginLeft: "-5px" }} />
                          );
                        } if (loan === "SRM") {
                          return (
                            index === 0 ? <img src={SRM} alt="SRM" key={index} /> : <img src={SRM} alt="SRM" key={loan} style={{ marginLeft: "-5px" }} />
                          );
                        }
                        return null;
                    })
                }
                <div style={{ marginTop: 10 }}>
                    {
                        this.props.loans.map((loan: any, index: number) => {

                            if (loan === "BTC") {
                                return (
                                    index === this.props.loans.length - 1 ? <Typography.Text type="secondary">BTC</Typography.Text> : <Typography.Text type="secondary">BTC+</Typography.Text>
                                );
                            } if (loan === "SOLANA") {
                                return (
                                    index === this.props.loans.length - 1 ? <Typography.Text type="secondary">SOLANA</Typography.Text> : <Typography.Text type="secondary">SOLANA+</Typography.Text>
                                );
                            } if (loan === "USDC") {
                                return (
                                    index === this.props.loans.length - 1 ? <Typography.Text type="secondary">USDC</Typography.Text> : <Typography.Text type="secondary">USDC+</Typography.Text>
                                );
                            } if (loan === "USDT") {
                                return (
                                    index === this.props.loans.length - 1 ? <Typography.Text type="secondary">USDT</Typography.Text> : <Typography.Text type="secondary">USDT+</Typography.Text>
                                );
                            } if (loan === "ETH") {
                                return (
                                    index === this.props.loans.length - 1 ? <Typography.Text type="secondary">ETH</Typography.Text> : <Typography.Text type="secondary">ETH+</Typography.Text>
                                );
                            } if (loan === "SRM") {
                                return (
                                    index === this.props.loans.length - 1 ? <Typography.Text type="secondary">SRM</Typography.Text> : <Typography.Text type="secondary">SRM+</Typography.Text>
                                );
                            } if (loan === "FTT") {
                              return (
                                index === this.props.loans.length - 1 ? <Typography.Text type="secondary">FTT</Typography.Text> : <Typography.Text type="secondary">FTT+</Typography.Text>
                              );
                            } if (loan === "RAY") {
                              return (
                                index === this.props.loans.length - 1 ? <Typography.Text type="secondary">RAY</Typography.Text> : <Typography.Text type="secondary">RAY+</Typography.Text>
                              );
                            }
                            return null;
                        })
                    }
                    <Typography.Text>(${this.props.value})</Typography.Text>
                </div>
            </div>
        )
    }
}
