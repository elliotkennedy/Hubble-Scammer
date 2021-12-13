import "./ShowDepositValue.less";
import { Col, Row, Select, Typography } from "antd";
import React from 'react';

const { Option } = Select

export class ShowDepositValue extends React.Component<any, any> {
    constructor(props: any) {
        super(props)
        this.state = {
            value: props.value
        }
    }

    onChange = (value: any) => {
        this.setState({
            ...this.state,
            value
        })
        // console.log(value)
    };

    render() {
        return (
            <div className="sdv-container site-card-wrapper">
                <Row className="sdv-text-one">
                    <Col span={10} className="sdv-text-one">
                        <img alt="BTC" src="https://img.icons8.com/office/16/000000/bitcoin.png" />
                        <p>{this.props.item}</p>
                    </Col>
                    <Col span={4} className="sdv-font-size">
                        <p>{this.props.dep_value}</p>
                    </Col>
                    <Col span={1} />
                    <Col span={8} className="sdv-font-size">
                        <Select
                            showSearch
                            className="token-select-wrapper item-center"
                            onChange={this.onChange}
                        >
                            {
                                this.props.total_value.map((each: any, key: number) => (
                                    <Option key={key} value={each.deposit}>
                                        <Typography.Text>{each.symbol}</Typography.Text>
                                    </Option>
                                ))
                            }
                        </Select>
                    </Col>
                </Row>
            </div>
        );
    }
}
