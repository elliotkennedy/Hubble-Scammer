import * as React from "react";
import { Form, Slider, Typography, Input } from "antd";
import { isValidNumericInput } from "../../utils/utils";
import "./BorrowForm.less";


export function BorrowForm({
  topic,
  borrowStablecoinAmount,
  setBorrowStablecoinAmount,
  max }: BorrowFormProps) {

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isValidNumericInput(e.target.value)) {
      const number = Number(e.target.value.replace(",", ""));
      const value = number > max ? max : number;
      const rounded = Math.round(value * 100) / 100;
      setBorrowStablecoinAmount(rounded);
    }
  }

  return (
    <Form layout="vertical" style={{
      width: "100%",
      justifyContent: "center",
      margin: 0,
      border: 0,
      borderStyle: "solid",
      borderColor: "black"
    }}>
      <Form.Item className="space" style={{
        border: 0,
        borderStyle: "solid",
        borderColor: "black",
        marginBottom: 0
      }}>
        <Input
          bordered={false}
          value={borrowStablecoinAmount}
          style={{
            textUnderlinePosition: "under",
            textDecoration: "underline",
            textDecorationColor: "rgba(255, 255, 255, 0.08)",
            textDecorationThickness: "from-font",
            fontSize: 40,
            textAlign: "center",
            width: "100%",
            fontWeight: 800,
            color: "#FFFFFF",
          }}
          onChange={handleChange} />
      </Form.Item>
      <Form.Item className="space" style={{
        margin: 0,
        border: 0,
        borderStyle: "solid",
        borderColor: "black"
      }}>
        <Typography.Text style={{ color: "#FFFFFF", opacity: 0.6 }}>{topic}</Typography.Text>
      </Form.Item>
      <Form.Item className="space" style={{ marginBottom: 20 }}>
        <Slider
          marks={{
            0: 0,
            100: 100
          }}
          style={{ width: "60%", margin: "auto" }}
          value={borrowStablecoinAmount > max ? 100 : borrowStablecoinAmount / max * 100}
          onChange={(e) => {
            const value = max * e / 100;
            const rounded = Math.round(value * 100) / 100;
            setBorrowStablecoinAmount(rounded);
          }}
          min={0}
          max={100}
          tipFormatter={value => `${value || ''}`}
        />
      </Form.Item>
    </Form>
  )
}

interface BorrowFormProps {
  topic: string,
  borrowStablecoinAmount: number,
  setBorrowStablecoinAmount: (value: number) => void,
  max: number,
}
