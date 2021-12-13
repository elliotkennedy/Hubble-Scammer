import React from "react";
import { Modal } from "antd";

// Icons
import { ExclamationCircleOutlined } from '@ant-design/icons';

// import Link from '../components/Link';

export function confirmationModal({
  content = "",
  title = "",
  okText = "",
  cancelText = "",
  icon = <ExclamationCircleOutlined />,
  onOk = () => {},
  onCancel = () => {},
}) {
  (Modal.confirm as any)({
    title,
    icon,
    content,
    okText,
    cancelText,
    onOk,
    onCancel
  });
}
