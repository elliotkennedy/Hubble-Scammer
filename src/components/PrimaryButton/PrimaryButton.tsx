import { Button, Typography } from "antd";
import "./PrimaryButton.less";
import { ReactElement } from "react";

export interface PrimaryButtonInterface {
  onClick?: (arg?: any) => void;
  isLoading?: boolean;
  text: string;
  disabled?: boolean;
  icon?: ReactElement;
}

export const PrimaryButton = ({
  onClick,
  isLoading = false,
  text,
  disabled = false,
  icon,
}: PrimaryButtonInterface) => {
  if (isLoading) return <Typography.Text type="secondary">N/A</Typography.Text>;
  if (disabled)
    return (
      <Button className="prdisablestyle" disabled> {text} </Button>
    );
  return (
      <Button onClick={onClick} icon={icon} className="prbuttonstyle">
        {" "}
        {text}{" "}
      </Button>
    );
};
