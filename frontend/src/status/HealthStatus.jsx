import { Card, Statistic, Typography } from 'antd';
import { ClockCircleOutlined, MessageOutlined } from '@ant-design/icons';
import './HealthStatus.css';


const HealthStatus = ({ health, mentionsCount }) => {
  const formatDate = (dateString) => {
    if (!dateString) return 'Нет данных';
    return new Date(dateString).toLocaleString('ru-RU');
  };

  return (

    <div className='health-status'>
      <h1>📊 Мониторинг соцсетей {health?.status === 'OK' && (
        <span
          style={{
            width: 10,
            height: 10,
            borderRadius: '50%',
            backgroundColor: 'rgb(93 253 14)',
            display: 'inline-block',
            margin: '0px 0px 10px 0px',
          }}
        />
      )}</h1>
      <Statistic
        value={health?.timestamp ? formatDate(health.timestamp) : 'N/A'}
        prefix={<ClockCircleOutlined />}
        valueStyle={{ color: 'wheat' }}
      />
      <Statistic
        value={mentionsCount}
        prefix={<MessageOutlined />}
        valueStyle={{ color: 'wheat' }}
      />
    </div>
  );
};

export default HealthStatus;