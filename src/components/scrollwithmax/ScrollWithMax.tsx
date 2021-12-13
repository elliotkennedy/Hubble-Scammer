import { Typography, Row, Col, Slider, Input } from "antd";
import React from "react";
import "./ScrollWithMax.less";

const { Link } = Typography;

export class ScrollWithMax extends React.Component<any, any> {

    constructor(props: any) {
        super(props)
        this.state = {
            value: props.value,
            ratio: props.ratio
        }
    }

    onClickMaxBtn = () => {
        this.setState({
            ...this.state,
            ratio: this.props.max
        })
        this.props.onChange?.(this.state.ratio, this.props.keyvalue);
    }

    onChange = (_value: number) => {
        console.log(_value);
        if (_value > this.props.max) _value = this.props.max;
        this.setState({
            ...this.state,
            ratio: _value
        })
    }

    onScrollChange = (value: any) => {
        this.setState({
            ...this.state,
            ratio: value
        })
    };

    render() {

        return (
            <Row>
                <Col span={4} />
                <Col span={16}>
                    <div className="item-center justify-center">
                        <Input value={this.state.ratio} bordered={false} onChange={(e) => { this.onChange(Number(e.target.value)); this.onScrollChange(Number(e.target.value)) }} style={{
                            fontSize: 40,
                            textAlign: "center",
                            width: "100%",
                            fontWeight: 800,
                            color: "white",
                            marginBottom: "10px",
                            textDecoration: "underline",
                            textDecorationColor: "rgba(255, 255, 255, 0.08)",
                            textDecorationThickness: "from-font",
                            textUnderlinePosition: "under",
                        }} />
                    </div>
                    <div className="item-center justify-center">
                        <Typography.Text type="secondary" style={{ marginBottom: "20px" }}>Cur Leverage: {this.state.ratio}x | Max Leverage: 10x</Typography.Text>
                    </div>
                    <div className="item-center justify-center">
                        <Slider
                            value={Number(this.state.ratio)}
                            onChange={(value) => this.onScrollChange(value)}
                            min={this.props.min}
                            max={this.props.scrollmax}
                            tipFormatter={value => `${value ? `${value  }x` : ''}`}
                            style={{ width: "100%" }}
                        />
                    </div>
                </Col>
                <Col span={4}>
                  <Link className="maxcontainer" onClick={this.onClickMaxBtn}>
                    MAX
                  </Link>
                </Col>
            </Row>
        )
    }
}
