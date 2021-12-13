import React from "react";
import { VaultComponent } from "./VaultComponent";

function VaultComponentContainer(props: { vaultsData: Array<VaultContainer> }) {
    return <div
        style={{
            marginTop: "40px",
            justifyContent: "space-between",
        }}
        className="item-center"
    >
        {props.vaultsData.map((vault: VaultContainer) => {
            let isPriceUSD = true;
            if (typeof vault.price === 'string') {
                isPriceUSD = !(vault.price.indexOf('%') > -1);
            }
            return (
                <VaultComponent
                    key={vault.topic}
                    topic={vault.topic}
                    price={isPriceUSD ? `$${vault.price}` : `${vault.price}`}
                    limit={vault.limit}
                />
            )
        })}
    </div>
}

export interface VaultContainer {
    topic: string
    price: string | number
    limit: boolean
}

export default React.memo(VaultComponentContainer)
