
import { Button, Result } from 'antd'
import React from 'react'
import Paragraph from 'antd/lib/typography/Paragraph'
import { Text } from '../text'
import { CloseCircleOutlined } from '@ant-design/icons'

export const Unauthorized = () => {
  return (
    <Result
    status="error"
    title="Unauthorized Access for admin"
    subTitle="Please contact administrator"
    extra={[
      <Button type="primary" key="console">
        Log Out
      </Button>,
    ]}
  >
    <div className="desc">
      <Paragraph>
        <Text
          strong
          style={{
            fontSize: 16,
          }}
        >
          Here are some reasons why you are seeing this error:
        </Text>
      </Paragraph>
      <Paragraph>
        <CloseCircleOutlined className="site-result-demo-error-icon" /> Your account has been
        frozen. <a>Thaw immediately &gt;</a>
      </Paragraph>
      <Paragraph>
        <CloseCircleOutlined className="site-result-demo-error-icon" /> Your account is not yet
        eligible to apply. <a>Apply Unlock &gt;</a>
      </Paragraph>
    </div>
  </Result>
  )
}
