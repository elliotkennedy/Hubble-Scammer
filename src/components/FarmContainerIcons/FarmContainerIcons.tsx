import USDH from "../../assets/usdh.png";
import HBB from "../../assets/hbb.png";
import USDC from "../../assets/usdc.png";

export function FarmContainerIcons({ item }: FarmContainerIconsProps) {

    console.log('item', item)

    return (
        <div>
            {
                item.map((eitem, index: number) => {
                    const marleft = `${-20 * (item.length - index - 1)}px`;
                    const zind = item.length - index;
                    if (eitem === "USDH") {
                        return (
                            <img alt="USDH" src={USDH} style={{ width: "46px", height: "46px", marginRight: marleft, zIndex: zind, position: "relative" }} />
                        );
                    } if (eitem === "HBB") {
                        return (
                            <img alt="HBB" src={HBB} style={{ width: "46px", height: "46px", marginRight: marleft, zIndex: zind, position: "relative" }} />
                        );
                    } if (eitem === "USDC") {
                        return (
                            <img alt="USDC" src={USDC} style={{ width: "46px", height: "46px", marginRight: marleft, zIndex: zind, position: "relative" }} />
                        );
                    }
                    return null;
                })
            }
        </div>
    )
}

interface FarmContainerIconsProps {
    item: Array<string>,
}
