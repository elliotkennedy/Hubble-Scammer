import React, { useMemo } from 'react';

import { Card, Col, Row, Typography, Tooltip } from "antd";
import { QuestionCircleFilled } from '@ant-design/icons';
import { CSSProperties } from 'hoist-non-react-statics/node_modules/@types/react';

import "../../antd.customize.less";
import { SolanaToken } from "../../constants";

import { formatNumber } from "../../utils/utils";

const { Title } = Typography;

export interface LiquidationTokenInfo {
  symbol: SolanaToken,
  currentPrice: number,
  liquidationPrice: string | 0.001 | number | string | "Immediate liquidation",
  pctChange: string | 0.001 | number | string | "Immediate liquidation"
}

interface BorrowSecondBoxProps {
  borrowStablecoinAmount: number,
  currentDepositedValue: number | undefined,
  collateralRatio: number,
  liquidationPrices: Array<LiquidationTokenInfo>
}

interface BorrowingInfoTitleProps {
  title: string
  titleTooltip: string
  style: CSSProperties | undefined
}

interface BorrowingInfoItemProps {
  title: string
  price: string
  stylePrice: CSSProperties | undefined
}

const BorrowTitleItem = ({ title, titleTooltip, style }: BorrowingInfoTitleProps) => {
  return (
    <div className="item-center" style={style}>
      <Typography.Text className="borrowing-info-title">{title}</Typography.Text>
      <Tooltip placement="right" title={titleTooltip}><QuestionCircleFilled style={{ marginLeft: "10px", marginBottom: "10px" }} /></Tooltip>
    </div >
  )
}

const BorrowInfoItem = ({ title, price, stylePrice }: BorrowingInfoItemProps) => useMemo(() => {
  return (
    <div className="item-center" style={{ justifyContent: "space-between" }}>
      <Typography.Text className="borrowing-info-item">{title}</Typography.Text>
      <Typography.Text strong style={stylePrice}>{price}</Typography.Text>
    </div>
  )
}, [title, price, stylePrice])

const BorrowSecondBox = ({ borrowStablecoinAmount, currentDepositedValue, collateralRatio, liquidationPrices }: BorrowSecondBoxProps) => {
  return (
    <Col className="second-borrow-box">
      <div>
        <Row>
          <Col span={24}>
            <Card style={{ textAlign: "left", borderColor: "rgba(05,250,255,0.15)" }}>
              <BorrowTitleItem
                title="Borrowing info"
                titleTooltip={`You are borrowing $${formatNumber.format(borrowStablecoinAmount)} and paying a fee 0.5% for a total of $${formatNumber.format(borrowStablecoinAmount * 0.005)}. Your total debt will be $${formatNumber.format(borrowStablecoinAmount * 1.005)}.`}
                style={{}}
              />
              <BorrowInfoItem title='Depositing' price={`$${formatNumber.format(currentDepositedValue)}`} stylePrice={undefined} />
              <BorrowInfoItem title='Borrowing' price={`$${formatNumber.format(borrowStablecoinAmount)}`} stylePrice={undefined} />
              <BorrowInfoItem title='Fee' price={`$${formatNumber.format(borrowStablecoinAmount * 0.005)} (0.5%)`} stylePrice={undefined} />

              <BorrowTitleItem
                title="Liquidation info"
                titleTooltip={`Your collateral ratio of ${formatNumber.format(collateralRatio)}% is calculated as Deposits/Borrow, that is ${formatNumber.format(currentDepositedValue)}/${formatNumber.format(borrowStablecoinAmount)}. At 110% you risk liquidation.`}
                style={{ marginTop: "10px" }}
              />
              <BorrowInfoItem
                title='Collateral Ratio'
                price={`${formatNumber.format(collateralRatio)}%`}
                stylePrice={{
                  color: collateralRatio < 110 ? "#FF0000" :
                    collateralRatio < 150 ? "#FF9900" :
                      "#00FF00"
                }}
              />
              {
                liquidationPrices.map((liquidationInfo: LiquidationTokenInfo) =>
                  <BorrowInfoItem title={`${liquidationInfo.symbol} Liquidation Price`} price={`${liquidationInfo.liquidationPrice}${liquidationInfo.pctChange}`} stylePrice={undefined} />
                )
              }

              <BorrowTitleItem
                title="Yield info"
                titleTooltip='Your collateral earns yield while it sits in our contracts. APY is calculated as the weighted sum of all APYs for each coin. Breakeven Time represents how long it takes for the one off borrowing fee to be repaid by the current APY.'
                style={{ marginTop: "10px" }}
              />
              <BorrowInfoItem title='Estimated APY' price="5.5%" stylePrice={undefined} />
              <BorrowInfoItem title='Breakeven Time' price="24 Days" stylePrice={undefined} />
            </Card >
            <div style={{ textAlign: "left", marginTop: "20px", paddingLeft: 5, paddingRight: 5, }}>
              <Title style={{ fontSize: 16 }}>About USDH</Title>
              <Typography.Text className="borrowing-info-item">USDH is an algorithmic stablecoin, fully backed by collateral and redeemable at face value. Swap it to other stablecoins with minimal slippage at <span style={{ opacity: 1 }}>saber.so</span> and <span style={{ opacity: 1 }}>mercurial.fi.</span> Read our <span style={{ color: "white" }}>docs.</span></Typography.Text>
            </div>
          </Col>
        </Row >
      </div >
    </Col >
  );
};

export default React.memo(BorrowSecondBox);
