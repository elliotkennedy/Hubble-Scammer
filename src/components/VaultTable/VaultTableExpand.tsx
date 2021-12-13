import { Col, Row, Typography } from "antd";
import { ExportOutlined } from "@ant-design/icons";
import React from "react";
import { PrimaryButton } from "../PrimaryButton/PrimaryButton";
import VaultTableRow from "./VaultTableRow";
import { formatNumber, formatPct, formatUSD, lamportsToColl } from "../../utils/utils";
import './VaultTableExpand.less'
import { SolanaToken, STABLECOIN_DECIMALS } from "../../constants";

const VaultTableExpand = ({ vaultTableRow, getPrice, addCollateral, withdrawCollateral }: VaultTableExpandProps) => {

  let totalValue = 0;
  const priceAndValueMap = Object.entries(vaultTableRow.depositedCollateral)
    .filter(collateralItem => collateralItem[1] > 0)
    .reduce((curr, collateralItem) => {
      const token = collateralItem[0].toUpperCase() as SolanaToken;
      const price = getPrice(token);
      const value = lamportsToColl(collateralItem[1], token) * price; // todo precision
      curr[collateralItem[0]] = { price, amount: collateralItem[1], value };
      totalValue += value;
      return curr;
    }, {} as Record<string, { price: number, amount: number, value: number }>)

  const getLiquidationPrice = (tokenCollateralAmount: number, tokenCollateralPrice: number, _totalValue: number, borrowedStablecoin: number): number => {
    const liquidationAmount = borrowedStablecoin * 1.1;
    const dropValue = (_totalValue - liquidationAmount) / tokenCollateralAmount;
    const liquidationPrice = tokenCollateralPrice - dropValue;
    return liquidationPrice > 0 ? liquidationPrice : 0;
  }

  return <>
    <div className="expanded-row">
      <Row>
        <Col span={3}>
          <Typography.Text type="secondary">Tokens</Typography.Text>
        </Col>
        <Col span={3}>
          <Typography.Text type="secondary">Amount</Typography.Text>
        </Col>
        <Col span={3}>
          <Typography.Text type="secondary">Value</Typography.Text>
        </Col>
        <Col span={3}>
          <Typography.Text type="secondary">Cur / Liq Price</Typography.Text>
        </Col>
        <Col span={2}>
          <Typography.Text type="secondary">Yield</Typography.Text>
        </Col>
        <Col span={3}>
          <Typography.Text type="secondary">Yield Strategy</Typography.Text>
        </Col>
        {/* <Col span={2}>
          <Typography.Text type="secondary">PnL</Typography.Text>
        </Col> */}
        <Col span={7}>
          <Typography.Text type="secondary">Actions</Typography.Text>
        </Col>
      </Row>
      {
        Object.entries(vaultTableRow.depositedCollateral)
          .filter(item => item[1] > 0)
          .map((item) => {
            const tokenMapKey = item[0];
            const tokenMapValue = lamportsToColl(item[1], tokenMapKey as SolanaToken);
            const currentPrice = priceAndValueMap[tokenMapKey].price;
            const liquidationPrice = getLiquidationPrice(tokenMapValue, currentPrice, totalValue, vaultTableRow.borrowedStablecoin / STABLECOIN_DECIMALS);
            return (
              <Row key={tokenMapKey} style={{ marginTop: "10px" }} className="item-center">
                <Col span={3}>
                  <Typography.Text>{tokenMapKey.toUpperCase()}</Typography.Text>
                </Col>
                <Col span={3}>
                  {/* todo precision */}
                  <Typography.Text>{formatNumber.format(tokenMapValue)}</Typography.Text>
                </Col>
                <Col span={3}>
                  <Typography.Text>{formatUSD.format(priceAndValueMap[tokenMapKey].price * tokenMapValue)}</Typography.Text>
                </Col>
                <Col span={3}>
                  <Typography.Text>{`${formatUSD.format(currentPrice)} / ${liquidationPrice > 0 ? formatUSD.format(liquidationPrice) : '-'}`}</Typography.Text>
                </Col>
                <Col span={2}>
                  {/* todo yield */}
                  <Typography.Text>{formatPct.format(0)}</Typography.Text>
                </Col>
                <Col span={3}>
                  {/* todo yieldstrategy */}
                  <Typography.Text>port.finance<ExportOutlined /></Typography.Text>
                </Col>
                {/* <Col span={2}>
                <Typography.Text>{formatUSD.format(0)}</Typography.Text>
              </Col> */}
                < Col span={6} className="item-center" style={{ justifyContent: "space-between" }
                }>
                  <PrimaryButton text="Deposit" isLoading={false} disabled={false} onClick={ () => addCollateral(vaultTableRow)}/>
                  <div style={{ marginLeft: "5px" }} />
                  <PrimaryButton text="Withdraw" isLoading={false} disabled={false} onClick={ () => withdrawCollateral(vaultTableRow)} />
                  <div style={{ marginLeft: "5px" }} />
                  <PrimaryButton text="Strategy" isLoading={false} disabled={false} />
                </Col>
              </Row>
            );
          })
      }
    </div >
  </>
}

interface VaultTableExpandProps {
  vaultTableRow: VaultTableRow;
  addCollateral: (vaultTableRow: VaultTableRow) => void
  withdrawCollateral: (vaultTableRow: VaultTableRow) => void
  getPrice: (token: SolanaToken) => number
}

export default VaultTableExpand;
