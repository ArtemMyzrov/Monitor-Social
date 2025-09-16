import { useState, useEffect } from 'react'
import axios from 'axios'
import { 
  Card, 
  List, 
  Tag, 
  Typography, 
  Spin,
  Alert,
  Row,
  Col,
  Statistic,
  Space
} from 'antd'
import { 
  MessageOutlined, 
  ClockCircleOutlined, 
  EyeOutlined,
  LinkOutlined,
  LoadingOutlined
} from '@ant-design/icons'
import './App.css'

const { Title, Text } = Typography

function App() {
  const [health, setHealth] = useState(null)
  const [mentions, setMentions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const loadingIcon = <LoadingOutlined style={{ fontSize: 24 }} spin />

  useEffect(() => {
    checkHealth()
    fetchMentions()
  }, [])

  const checkHealth = async () => {
    try {
      const response = await axios.get('/api/health')
      setHealth(response.data)
    } catch (error) {
      setError(error.message)
    }
  }

  const fetchMentions = async () => {
    try {
      const response = await axios.get('/api/mentions')
      setMentions(response.data)
    } catch (error) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const getSourceColor = (source) => {
    if (source.includes('VK')) return 'blue'
    if (source.includes('Telegram')) return 'green'
    if (source.includes('RSS')) return 'orange'
    return 'gray'
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('ru-RU')
  }

  if (loading) {
    return (
      <div className="app-loading">
        <Space direction="vertical" size="large" align="center">
          <Spin indicator={loadingIcon} size="large" />
          <Text type="secondary">Загрузка данных...</Text>
        </Space>
      </div>
    )
  }

  if (error) {
    return (
      <div className="app">
        <Alert
          message="Ошибка загрузки"
          description={error}
          type="error"
          showIcon
        />
      </div>
    )
  }

  return (
    <div className="app">
      <div className='container'>
      <div className="app-header">
        <Title level={1}>📊 Мониторинг соцсетей</Title>
        
        <Row gutter={16} className="stats-row">
          <Col span={8}>
            <Card>
              <Statistic
                title="Всего упоминаний"
                value={mentions.length}
                prefix={<MessageOutlined />}
              />
            </Card>
          </Col>
          <Col span={8}>
            <Card>
              <Statistic
                title="Статус системы"
                value={health?.status || 'UNKNOWN'}
                valueStyle={{ color: health?.status === 'OK' ? '#3f8600' : '#cf1322' }}
              />
            </Card>
          </Col>
          <Col span={8}>
            <Card>
              <Statistic
                title="Последнее обновление"
                value={health?.timestamp ? formatDate(health.timestamp) : 'N/A'}
                prefix={<ClockCircleOutlined />}
              />
            </Card>
          </Col>
        </Row>
      </div>

      <div className="mentions-section">
        <h2>Найденные упоминания</h2>
        
        <List
          itemLayout="vertical"
          size="large"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total, range) => 
              `${range[0]}-${range[1]} из ${total} упоминаний`
          }}
          dataSource={mentions}
          renderItem={(mention) => (
            <List.Item key={mention.id}>
              <Card 
                className="mention-card"
                actions={[
                  <a 
                    href={mention.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    key="view-link"
                  >
                    <EyeOutlined /> Открыть оригинал
                  </a>
                ]}
              >
                <div className="mention-header">
                  <Tag color={getSourceColor(mention.source)}>
                    {mention.source}
                  </Tag>
                  <Text type="secondary">
                    <ClockCircleOutlined /> {formatDate(mention.date_found)}
                  </Text>
                </div>

                <div className="mention-content">
                  <Text>{mention.text}</Text>
                </div>

                <div className="mention-footer">
                  <a 
                    href={mention.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="mention-link"
                  >
                    <LinkOutlined /> Источник
                  </a>
                </div>
              </Card>
            </List.Item>
          )}
        />
      </div>
      </div>
    </div>
  )
}

export default App