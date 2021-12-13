import React from "react";
import { notification } from "antd";
// import Link from '../components/Link';

export function notifyicon({
    message = "",
    description = undefined as any,
    txid = "",
    type = "info",
    placement = "bottomLeft",
    key = '',
    duration = 4.5,
}) {
    if (txid) {
        //   <Link
        //     external
        //     to={'https://explorer.solana.com/tx/' + txid}
        //     style={{ color: '#0000ff' }}
        //   >
        //     View transaction {txid.slice(0, 8)}...{txid.slice(txid.length - 8)}
        //   </Link>

        description = <></>;
    }
    (notification as any)[type]({
        key: key || null,
        message: type === "success" ? <span style={{ color: "#00EAB2" }}>{message}</span> : type === "error" ? <span style={{ color: "#FF0505" }}>{message}</span> : type === "warning" ? <span style={{ color: "#FF9900" }}>{message}</span> : <span style={{ color: "#8F8F8F" }}>{message}</span>,
        description: (
            <span style={{ color: "white" }}>{description}</span>
        ),
        placement,
        style: {
            backgroundColor: "#2D2F42",
            borderRadius: "20px",
            border: "1px solid transparent",
            width: "100%",
            boxShadow: "none",
        },
        duration,
    });
}

export function closeNotification(key: string) {
    notification.close(key);
}
