import React from 'react'
import { Link } from 'react-router-dom'
import { Button, Card, Typography } from "antd";
import { DoubleLeftOutlined } from '@ant-design/icons';
import { LABELS } from "../../../constants";

const { Title } = Typography;

const Error404 = ({ ...props }) => {
  return (
    <Card
      title={LABELS.PAGE_NOT_FOUND_TITLE}
      actions={[
        <Link to="/">
          <Button icon={<DoubleLeftOutlined />} type="primary" ghost>
            {LABELS.PAGE_NOT_FOUND_ACTION}
          </Button>
        </Link>
      ]}
      {...props}
    >
      <Title level={5} type="secondary">
        {LABELS.PAGE_NOT_FOUND_TEXT}
      </Title>
    </Card>
  )
}

export default Error404
