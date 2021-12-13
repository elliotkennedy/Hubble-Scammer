import { Card, Typography, Button } from "antd";
import { PlusOutlined } from '@ant-design/icons';
import "./VaultButton.less";

export const VaultButton = (props: {
    topic: string;
    description: string;
    color: string;
}) => {
    return (
        <Card className="card-shadow">
            <div className="btn-container item-center">
                <div style={{ textAlign: "left" }}>
                    <Typography.Text strong>{props.topic}</Typography.Text> <br />
                    <Typography.Text type="secondary">{props.description}</Typography.Text>
                </div>
                <div>
                    <Button shape="circle" className="plusbtn" style={{ color: props.color } as React.CSSProperties} icon={<PlusOutlined />} size="large" />
                </div>
            </div>
        </Card>
    );
};
