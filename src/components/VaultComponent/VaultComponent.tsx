import { Typography, Progress } from "antd";

const { Title } = Typography;


export function VaultComponent({ topic, price, limit }: VaultComponentProps) {
    return (
        <>
            <div className="vaultmaincomponent" style={{ textAlign: 'left' }}>
                {
                    limit === false ?
                        <div>
                            <Typography.Text type="secondary">{topic}</Typography.Text>
                            <Title level={1} className="titletop">{price}</Title>
                        </div> : <div className="item-center" style={{ justifyContent: "space-between" }}>
                            <div>
                                <Typography.Text type="secondary">{topic}</Typography.Text>
                                <Title level={1} className="titletop">{price}</Title>
                            </div>
                            <Progress
                                type="circle"
                                strokeColor={{
                                    '0%': "rgba(5, 250, 255, 0.7)",
                                    '100%': 'rgba(122, 132, 255, 0.7) 66.07%)',
                                }}
                                percent={20}
                                format={percent => `Limit ${percent || '-'}%`}
                                width={75}
                            />
                        </div>
                }
            </div>
            <div style={{ marginLeft: "20px" }} />
        </>
    )
}

interface VaultComponentProps {
    topic: string,
    price: string,
    limit: boolean,
}
