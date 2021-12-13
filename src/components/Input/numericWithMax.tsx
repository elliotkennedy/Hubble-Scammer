import React, { useState } from "react";
import { Input, Typography } from "antd";
import { MinusCircleOutlined } from '@ant-design/icons';
import "./numericWithMax.less";
import { SolanaToken } from "../../constants";
import { isValidNumericInput } from "../../utils/utils";

const { Link } = Typography;

export function NumericInputWithMax({
  topic,
  value,
  onChangeCallback,
  symbol,
  max,
  onRemove,
  leftitem,
  currentdeposit
}:
  {
    currentdeposit?: string,
    topic: string,
    leftitem: any,
    onRemove: any,
    max: number,
    symbol: any,
    onChangeCallback: (value: string | number, token: SolanaToken) => void,
    value: string | number
  }) {

  const [currentValue, setCurrentValue] = useState<string | number>(value);
  const [isMinusShown, setIsMinusShown] = useState<boolean>(false);

  const onChange = (e: React.FormEvent<HTMLInputElement>) => {
    if (isValidNumericInput(e.currentTarget.value)) {
      let inputValue = e.currentTarget.value;

      if (Number(inputValue) > max) {
        inputValue = String(max);
      }

      setCurrentValue(inputValue);
      onChangeCallback(inputValue, symbol);
    }
  };

  const onClickMaxBtn = () => {
    setCurrentValue(max);
    onChangeCallback(max, symbol);
  };


  return (
    <div
      key={symbol}
      style={{ textAlign: "left" }}
      id="card-body"
      onMouseEnter={() => setIsMinusShown(true)}
      onMouseLeave={() => setIsMinusShown(false)}>

      <div className="item-center" style={{ width: "100%", justifyContent: "space-between" }}>
        <div className="item-center" style={{ width: "100%", justifyContent: "space-between" }}>
          <Typography.Text className="topic">{topic}</Typography.Text>
          <Typography.Text className="topic">{currentdeposit}</Typography.Text>
          {isMinusShown ? (
            <Link role="button" className="minuscircle" onClick={() => onRemove()}>
              <MinusCircleOutlined />
            </Link>
          ) : (
            <div style={{ height: "14px" }} />
          )}
        </div>
      </div>
      <div className="item-center" style={{
        marginTop: "12px",
      }}>
        {leftitem || null}
        <Input
          // {...this.props}
          value={currentValue}
          onChange={onChange}
          className="input-style"
          bordered={false}
          style={{
            MozAppearance: "textfield",
            WebkitAppearance: "none",
            margin: 0
          }}
        />
        <Link
          style={{ width: 60, fontSize: 12, color: "white" }}
          onClick={onClickMaxBtn}
          role="button"
        >
          MAX
        </Link>
      </div>
    </div>
  );
}
