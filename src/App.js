import React, { useState } from 'react';
import { Layout, Typography, Card, Form, Input, Button, message, Row, Col } from 'antd';
import { FolderOpenOutlined, KeyOutlined, LockOutlined, UnlockOutlined } from '@ant-design/icons';

// Sử dụng API từ preload (nếu dùng preload.js).
const { selectDirectory, generateKey, encryptFiles, decryptFiles } = window.electronAPI || {};

const { Header, Content, Footer } = Layout;
const { Title, Text } = Typography;
message.config({
  duration: 0
});

function App() {
  const [keyDir, setKeyDir] = useState('');
  const [sourceDir, setSourceDir] = useState('');
  const [outputDir, setOutputDir] = useState('');

  const handleSelectKeyDir = async () => {
    try {
      const dir = await selectDirectory();
      if (dir) setKeyDir(dir);
    } catch (error) {
      message.error(error.message);
    }
  };

  const handleSelectSourceDir = async () => {
    try {
      const dir = await selectDirectory();
      if (dir) setSourceDir(dir);
    } catch (error) {
      message.error(error.message);
    }
  };

  const handleSelectOutputDir = async () => {
    try {
      const dir = await selectDirectory();
      if (dir) setOutputDir(dir);
    } catch (error) {
      message.error(error.message);
    }
  };

  const onGenerateKey = async () => {
    if (!keyDir) {
      message.warning('Vui lòng chọn thư mục Key!');
      return;
    }
    try {
      const result = await generateKey({ keyDir });
      message.success(result.message);
    } catch (error) {
      message.error(error.message);
    }
  };

  const onEncrypt = async () => {
    if (!keyDir || !sourceDir || !outputDir) {
      message.warning('Vui lòng chọn đủ 3 thư mục!');
      return;
    }
    try {
      const result = await encryptFiles({ keyDir, sourceDir, outputDir });
      message.success(result.message);
    } catch (error) {
      message.error(error.message);
    }
  };

  const onDecrypt = async () => {
    if (!keyDir || !sourceDir || !outputDir) {
      message.warning('Vui lòng chọn đủ 3 thư mục!');
      return;
    }
    try {
      const result = await decryptFiles({ keyDir, sourceDir, outputDir });
      message.success(result.message);
    } catch (error) {
      message.error(error.message);
    }
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ backgroundColor: '#001529', display: 'flex', alignItems: 'center' }}>
        <Title style={{ color: '#fff', margin: 0 }}>IOEncrypt</Title>
      </Header>

      <Content style={{ padding: '20px' }}>
        <Card style={{ marginBottom: '20px' }}>
          <Title level={4}>Giới thiệu</Title>
          <Text>IOEncrypt - Một phần mềm mã hoá/giải mã file đơn giản, phục vụ nhu cầu bảo vệ dữ liệu.</Text>
          <br />
          <Text>Tác giả: Nguyễn Trọng Long</Text>
        </Card>

        <Card title="Cấu hình thư mục" style={{ marginBottom: '20px' }}>
          <Form layout="vertical">
            <Row gutter={16}>
              <Col span={8}>
                <Form.Item label="Thư mục Key">
                  <Input
                    placeholder="Chọn thư mục Key"
                    value={keyDir}
                    disabled
                    addonAfter={
                      <FolderOpenOutlined onClick={handleSelectKeyDir} style={{ cursor: 'pointer' }}/>
                    }
                  />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item label="Thư mục Nguồn (Source)">
                  <Input
                    placeholder="Chọn thư mục chứa file cần mã hoá/giải mã"
                    value={sourceDir}
                    disabled
                    addonAfter={
                      <FolderOpenOutlined onClick={handleSelectSourceDir} style={{ cursor: 'pointer' }}/>
                    }
                  />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item label="Thư mục Kết Quả (Output)">
                  <Input
                    placeholder="Chọn thư mục lưu kết quả"
                    value={outputDir}
                    disabled
                    addonAfter={
                      <FolderOpenOutlined onClick={handleSelectOutputDir} style={{ cursor: 'pointer' }}/>
                    }
                  />
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </Card>

        <Card title="Thao tác">
          <Row gutter={16}>
            <Col>
              <Button
                type="primary"
                icon={<KeyOutlined />}
                onClick={onGenerateKey}
              >
                Tạo Key
              </Button>
            </Col>
            <Col>
              <Button
                type="primary"
                icon={<LockOutlined />}
                onClick={onEncrypt}
              >
                Mã Hoá
              </Button>
            </Col>
            <Col>
              <Button
                type="primary"
                icon={<UnlockOutlined />}
                onClick={onDecrypt}
              >
                Giải Mã
              </Button>
            </Col>
          </Row>
        </Card>
      </Content>

      <Footer style={{ textAlign: 'center' }}>
        IOEncrypt ©2025 Created by Long
      </Footer>
    </Layout>
  );
}

export default App;
