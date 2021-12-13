import { Button } from "antd";
import "./SecondaryButtonWithIcon.less";
import { ExportOutlined } from "@ant-design/icons";

export interface SecondaryButtonWithIconInterface {
    onClick?: (arg?: any) => void;
    isLoading: boolean;
    text: string;
    disabled: boolean;
}


export const SecondaryButtonWithIcon = ({ onClick, isLoading, text, disabled }: SecondaryButtonWithIconInterface) => {
    if (isLoading)
        return (
            <Button className="iconloadingstyle" loading />
        );
    if (disabled)
        return (
            <Button className="icondisablestyle" disabled> {text} <ExportOutlined /> </Button>
        );
    return (
            <Button onClick={onClick} className="iconbuttonstyle"> {text} <ExportOutlined /> </Button>
        );
};
