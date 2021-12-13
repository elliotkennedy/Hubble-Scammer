import { Button } from "antd";
import "./SecondaryButton.less";

export interface SecondaryButtonInterface {
    onClick?: (arg?: any) => void;
    isLoading: boolean;
    text: string;
    disabled: boolean;
}


export const SecondaryButton = ({ onClick, isLoading, text, disabled }: SecondaryButtonInterface) => {
    if (isLoading)
        return (
            <Button className="loadingstyle" loading />
        );
    if (disabled)
        return (
            <Button className="disablestyle" disabled> {text} </Button>
        );
    return (
            <Button onClick={onClick} className="buttonstyle"> {text} </Button>
        );
};
