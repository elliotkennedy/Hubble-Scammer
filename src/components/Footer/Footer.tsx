import { Typography } from "antd";
import { MediumCircleFilled } from "@ant-design/icons";
import './Footer.less'
import telegram from "../../assets/telegram.png";
import discord from "../../assets/discord.png";
import twitter from "../../assets/twitter.png";
import "../../antd.customize.less";

export const AppFooter = () => {

    return (
        <div className="footer-container">
            <Typography.Text type="secondary">Copyright ©2021 Hubble</Typography.Text>
            <div style={{ display: "flex" }}>
                <MediumCircleFilled style={{ fontSize: "24px", marginLeft: "10px" }} />
                <img alt="discord" src={discord} style={{ width: "24px", height: "24px", marginLeft: "10px", borderRadius: "15px" }} />
                <img alt="twitter" src={twitter} style={{ width: "24px", height: "24px", marginLeft: "10px" }} />
                <img alt="telegram" src={telegram} style={{ width: "24px", marginLeft: "10px" }} />
            </div>
        </div>
    );
};
