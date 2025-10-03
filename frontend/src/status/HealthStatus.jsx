import { Card, Row, Col, Statistic, Typography } from 'antd';
import { ClockCircleOutlined, MessageOutlined } from '@ant-design/icons';

const { Text } = Typography;

const HealthStatus = ({ health, mentionsCount }) => {
  const formatDate = (dateString) => {
    if (!dateString) return 'Нет данных';
    return new Date(dateString).toLocaleString('ru-RU');
  };

  return (
    <Card style={{ marginBottom: 16 }}>
      <Row gutter={16}>
        <Col span={8}>
          <Statistic
            title="Последнее обновление"
            value={health?.timestamp ? formatDate(health.timestamp) : 'N/A'}
            prefix={<ClockCircleOutlined />}
          />
        </Col>
        <Col span={8}>
          <Statistic
            title="Статус системы"
            value={health?.status || 'UNKNOWN'}
            valueStyle={{ color: health?.status === 'OK' ? '#3f8600' : '#cf1322' }}
          />
        </Col>
        <Col span={8}>
          <Statistic
            title="Всего упоминаний"
            value={mentionsCount}
            prefix={<MessageOutlined />}
          />
        </Col>
      </Row>
    </Card>
  );
};

export default HealthStatus;