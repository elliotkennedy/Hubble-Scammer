import { Button } from "antd";
import { DownOutlined } from "@ant-design/icons";
import "./SecondaryDropdownButton.less";

export interface SecondaryDropdownButtonInterface {
    onClick?: (arg?: any) => void;
    isLoading: boolean;
    text: string;
    disabled: boolean;
}


export const SecondaryDropdownButton = ({ onClick, isLoading, text, disabled }: SecondaryDropdownButtonInterface) => {
    if (disabled)
        return (
            <Button className="secondarydisablestyle" disabled loading={isLoading}> {text} <DownOutlined /> </Button>
        );
    return (
        <Button onClick={onClick} className="secondarybuttonstyle" loading={isLoading}> {text} <DownOutlined style={{ fontSize: 11 }} /></Button>
    );
};
