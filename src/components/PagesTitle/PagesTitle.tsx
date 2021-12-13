import React from "react";
import { Typography } from "antd";

const { Title } = Typography;

function PagesTitle({ title, description }: PagesTitleProps) {
    return <div style={{ textAlign: 'center', }}>
        <Title level={1} style={{ color: "white" }}>{title}</Title>
        <div style={{ width: 800, marginLeft: "auto", marginRight: "auto" }}>
            <Typography.Text style={{ fontSize: 14, color: "white" }}>{description}</Typography.Text>
        </div>
    </div>
}

interface PagesTitleProps {
    title: string
    description: string
}

export default React.memo(PagesTitle)
