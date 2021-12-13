import * as React from "react";
import { Typography, Row, Col, Radio, Input, Form, Slider } from "antd";
import { ChangeEvent, useState } from "react";
import "./ModalTabSelect.less";
import { roundDown } from "../../utils/math";
import { isValidNumericInput } from "../../utils/utils";

const { Link } = Typography;

interface ModalTabSelectProperties {
    topic: string,
    redeem?: boolean,
    max: number
    value: number,
    onValueChange?: (amount: number) => void
}

function ModalTabSelect({
    value,
    onValueChange = () => { },
    max,
    redeem = false,
    topic
}: ModalTabSelectProperties) {

    const [currentValue, setValue] = useState<number>(value);

    const onChange = (_value: number) => {
        if (_value > max) {
            _value = max;
        }
        setValue(_value);
        onValueChange(_value);
    }

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
      const {value: _value} = e.target;
      if (isValidNumericInput(_value)) {
        onChange(Number(_value))
      }
    }

    const handleSliderChange = (_value: number) => {
      const calculatedValue = max * _value / 100;
      const rounded = Math.round(calculatedValue * 100) / 100;
      setValue(rounded);
      onValueChange(rounded);
  }

    return (
        <Row>
            <Col span={4} />
            <Col span={16}>
                <div className="item-center justify-center">
                    {/* <Title level={1} type="secondary" style={{ marginBottom: "10px" }}>{this.state.value}</Title> */}
                    {
                        redeem === true ?
                            <Input value={currentValue} bordered={false}
                                onChange={handleChange}
                                style={{
                                    fontSize: 40,
                                    textAlign: "center",
                                    width: "100%",
                                    fontWeight: "bold",
                                    color: "white",
                                    textDecoration: "underline",
                                    textDecorationColor: "rgba(255, 255, 255, 0.08)",
                                    textDecorationThickness: "from-font",
                                    textUnderlinePosition: "under",
                                }} /> : <Input value={currentValue} bordered={false}
                                    onChange={handleChange}
                                    style={{
                                        fontSize: 40,
                                        textAlign: "center",
                                        width: "100%",
                                        fontWeight: 800,
                                        color: "white",
                                        textUnderlinePosition: "under",
                                        textDecoration: "underline",
                                        textDecorationColor: "rgba(255, 255, 255, 0.08)",
                                        textDecorationThickness: "from-font",
                                    }} />
                    }
                </div >
                <div className="item-center justify-center">
                    <Typography.Text type="secondary" style={{ marginBottom: "20px" }}>{topic}</Typography.Text>
                </div>
                <Form.Item className="space" style={{ marginBottom: 20 }}>
                    <Slider
                        marks={{
                            0: 0,
                            100: 100
                        }}
                        style={{ width: "60%", margin: "auto" }}
                        value={currentValue > max ? 100 : currentValue / max * 100}
                        onChange={handleSliderChange}
                        min={0}
                        max={100}
                        tipFormatter={calculatedValue => `${calculatedValue || ''}`}
                    />
                </Form.Item>
                <div className="item-center justify-center">
                    <Radio.Group defaultValue="25" buttonStyle="solid" className="radiocontainer">
                        <Radio.Button value="25" onClick={() => onChange(roundDown(max * 0.25, 2))} className="firstradiocontainer" >25%</Radio.Button>
                        <Radio.Button value="50" onClick={() => onChange(roundDown(max * 0.5, 2))} >50%</Radio.Button>
                        <Radio.Button value="75" onClick={() => onChange(roundDown(max * 0.75, 2))} >75%</Radio.Button>
                        <Radio.Button value="100" onClick={() => onChange(roundDown(max, 2))} className="lastradiocontainer">100%</Radio.Button>
                    </Radio.Group>
                </div>
            </Col >
            <Col span={4}>
                <Link className="maxcontainer" onClick={() => onChange(roundDown(max, 2))}>
                    MAX
                </Link>
            </Col>
        </Row >
    )
}

export default ModalTabSelect;
