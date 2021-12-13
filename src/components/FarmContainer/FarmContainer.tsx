import { Typography, Card } from "antd";
import { SecondaryButtonWithIcon } from "../SecondaryButtonWithIcon/SecondaryButtonWithIcon";
import { FarmContainerReward } from "../FarmContainerReward/FarmContainerReward";
import { FarmContainerIcons } from "../FarmContainerIcons/FarmContainerIcons";

export function FarmContainer({
    topic,
    description,
    price,
    item,
    buttonname,
    rewardtype,
}: FarmContainerProps) {
    return (
        <Card style={{ width: "388px", borderColor: "rgba(05,250,255,0.15)" }} >
            <div style={{ display: "flex", justifyContent: "space-between" }}>
                <div>
                    <Typography.Text>{topic}</Typography.Text> <br />
                    <Typography.Text style={{ fontSize: "28px" }}>{description}</Typography.Text>
                </div>
                <FarmContainerIcons item={item} />
            </div>
            <Typography.Text type="secondary">{price}</Typography.Text>
            <hr style={{ margin: "15px 0px" }} />
            <Typography.Text>Rewards:</Typography.Text>
            <FarmContainerReward rewardtype={rewardtype} />
            <div style={{ marginTop: "50px" }}>
                <SecondaryButtonWithIcon isLoading={false} disabled={false} text={buttonname} />
            </div>
        </Card>
    )
}

interface FarmContainerProps {
    topic: string,
    description: string,
    price: string,
    item: Array<string>,
    buttonname: string,
    rewardtype: boolean,
}
