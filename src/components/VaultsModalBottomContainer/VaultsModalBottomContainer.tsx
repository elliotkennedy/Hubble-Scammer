import { Typography } from "antd";
import "./VaultsModalBottomContainer.less";

function VaultsModalBottomContainer({
    firstLineTitle,
    firstLineValue,
    collateralRatioName = "Collateral Ratio",
    newCollateralRatio,
    prevCollateralRatio,
    className = "bottom-container",
    isPrev = true
}: VaultsModalBottomProps) {
    return (
        <div className={className}>
            <div className="item-center" style={{ justifyContent: "space-between", marginTop: 10 }}>
                <Typography.Text type="secondary">{firstLineTitle}</Typography.Text>
                <Typography.Text strong>{firstLineValue}</Typography.Text>
            </div>
            <div className="item-center" style={{ justifyContent: "space-between", marginTop: 10 }}>
                <Typography.Text type="secondary">{collateralRatioName}</Typography.Text>
                <div>
                    <Typography.Text strong>{newCollateralRatio}</Typography.Text>
                    <Typography.Text type="secondary">
                        {isPrev ? `(Prev.${prevCollateralRatio})` : prevCollateralRatio}
                    </Typography.Text>
                </div>
            </div>
        </div>
    )
}

interface VaultsModalBottomProps {
    firstLineTitle: string
    firstLineValue: string
    collateralRatioName?: string
    newCollateralRatio: string | null
    prevCollateralRatio: string
    className?: string
    isPrev?: boolean
}

export default VaultsModalBottomContainer;
