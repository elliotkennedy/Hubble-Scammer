import { Button } from "antd";
import "./SmallButton.less";

export interface SmallButtonInterface {
  onClick?: (arg?: any) => void;
  isLoading: boolean;
  text: string;
  disabled: boolean;
}


export const SmallButton = ({ onClick, isLoading, text, disabled }: SmallButtonInterface) => {
  if (isLoading) {
    return (
      <Button className="smloadingstyle" loading />
    );
  }
  return (
    // add onclick temp hack to allow any liquidation
    <Button onClick={onClick}
      // disabled={disabled}
      className={disabled ? "smdisablestyle" : "smbuttonstyle"}> {text} </Button>
  );
};
