import { useMemo } from 'react';
import { Typography, Modal, Checkbox, Button } from "antd";
import { InfoCircleOutlined } from '@ant-design/icons';

import "../../antd.customize.less";

import { SecondaryButton } from '../SecondaryButton/SecondaryButton';

interface BorrowModalPermissionPoolProps {
  permissionpool: boolean
  cancelclicked: () => void
  confirmclicked: () => void
  onChanged: (dchecked: boolean) => void,
  onChangeu: (uchecked: boolean) => void,
  uchecked: boolean,
  dchecked: boolean
}

const BorrowModalPermissionPool = ({ permissionpool, cancelclicked, confirmclicked, onChanged, onChangeu, uchecked, dchecked }: BorrowModalPermissionPoolProps) => {
  return useMemo(() => {
    return (
      <Modal
        title=""
        visible={permissionpool}
        onCancel={cancelclicked}
        className="modal-component"
        footer={[]}
        maskClosable={false}
      >
        <div style={{ color: "white", marginTop: "-5px" }} className="item-center">
          <InfoCircleOutlined style={{ fontSize: "20px", color: "white !important" }} />
          <Typography.Text style={{ fontSize: "15px", marginLeft: "10px" }}>This is a Permission Pool</Typography.Text>
        </div>
        <hr />
        <Typography.Text type="secondary">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. A morbi in duis leo dignissim cursus elit dictumst. Sagittis, suspendisse eget vel elementum id nullam amet. Eget diam quam at massa nullam pretium nam tincidunt at. Quisque etiam enim odio ut amet. Sit ut nulla vitae, commodo. Dictum ornare et nec at mi ut viverra gravida. Mauris vulputate morbi ultrices aliquam, mi, sociis sit eget.<br /><br />
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. A morbi in duis leo dignissim cursus elit dictumst. Sagittis, suspendisse eget vel elementum id nullam amet. Eget diam qua
          <br /> <br />
        </Typography.Text>
        <Checkbox style={{ marginTop: "5px" }} onChange={() => onChangeu(!uchecked)} checked={uchecked}>I understand</Checkbox>
        <br />
        <Checkbox style={{ marginTop: "20px" }} onChange={() => onChanged(!dchecked)} checked={dchecked}>Do not warn me about this again</Checkbox>
        <br />
        <div style={{ marginTop: "20px" }}>
          <SecondaryButton text="Confirm" isLoading={false} disabled={false} onClick={() => confirmclicked()} />
        </div>
        <div style={{ marginTop: "20px" }}>
          <Button className="cancel-button" type="text" onClick={() => cancelclicked()}>Cancel</Button>
        </div>
      </Modal>
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [permissionpool, uchecked, dchecked]);
};

export default BorrowModalPermissionPool;
