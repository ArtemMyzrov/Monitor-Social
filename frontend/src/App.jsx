import { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Typography,
  Spin,
  Alert,
  Space,
  Button,
  message,
} from 'antd';
import {
  LoadingOutlined,
  EyeOutlined as ViewsIcon,
} from '@ant-design/icons';

import GroupsManager from './groups/GroupsManager';
import SimpleDaysFilter from './filters/SimpleDaysFilter';
import HealthStatus from './status/HealthStatus';
import KeywordsManager from './keywords/KeywordsManager';
import MentionsList from './mentions/MentionsList';
import CoolLoader from './loader/CoolLoader';
import './styles/App.css';

const { Text } = Typography;

function App() {
  const [health, setHealth] = useState(null);
  const [mentions, setMentions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [monitoring, setMonitoring] = useState(false);
  const [error, setError] = useState(null);
  const [keywords, setKeywords] = useState([]);
  const [groups, setGroups] = useState([]);
  const [displayMentions, setDisplayMentions] = useState([]);

  const handleFilterApplied = (posts) => {
    setDisplayMentions(posts);
  };

  useEffect(() => {
    checkHealth();
    fetchMentions();
    fetchGroups();
    fetchKeywords();
    setDisplayMentions(mentions);
  }, []);

  const fetchGroups = async () => {
    const defaultGroups = [
      { screenName: 'volodin_saratov', name: 'Вячеслав Володин' },
      { screenName: 'rus_crime_saratov', name: 'Новости Саратова сегодня' },
      { screenName: 'saratov.life', name: 'Саратов Life' },
      { screenName: '64saratov', name: 'Типичный Саратов' },
      { screenName: 'capatoff', name: 'Регион 64' },
      { screenName: 'saratov_story', name: 'Подслушано Саратов' },
      { screenName: 'saratov_atypical', name: 'Нетипичный Саратов' },
      { screenName: 'sarobl', name: 'Саратовщина - Саратов и Саратовская область' },
      { screenName: 'saratov24', name: 'Саратов24' }
    ];
    try {
      setGroupsLoading(true);
      const response = await axios.get('/api/groups');
      const apiGroups = response.data.groups || [];
      const allGroups = [...defaultGroups, ...apiGroups];
      const uniqueGroups = allGroups.filter((group, index, self) =>
        index === self.findIndex(g => g.screenName === group.screenName)
      );
      setGroups(uniqueGroups);
    } catch (error) {
      console.error('Ошибка загрузки групп:', error);
      setGroups(defaultGroups);
    } finally {
      setGroupsLoading(false);
    }
  };

  const handleGroupsChange = async (newGroups) => {
    try {
      const response = await axios.put('/api/groups', { groups: newGroups });
      setGroups(response.data.groups);
    } catch (error) {
      message.error('Ошибка сохранения групп');
    }
  };

  const fetchKeywords = async () => {
    try {
      const response = await axios.get('/api/keywords');
      setKeywords(response.data.keywords || []);
    } catch (error) {
      console.error('Ошибка загрузки ключевых слов:', error);
      setKeywords([
        'льготная карта', 'транспортная льготная карта', 'не работает',
        'остановка', 'проезд', 'кондуктор', 'водитель', 'пассажир', 'перевозчик', 'льготная'
      ]);
    }
  };


  const checkHealth = async () => {
    try {
      const response = await axios.get('/api/health');
      setHealth(response.data);
    } catch (error) {
      console.error('Ошибка проверки здоровья:', error.message);
    }
  };

  const fetchMentions = async () => {
    try {
      const response = await axios.get('/api/mentions');
      setMentions(response.data);
      setDisplayMentions(response.data);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const runMonitoring = async () => {
    setMonitoring(true);
    try {
      const response = await axios.get('/api/vk/monitor-saratov');
      message.success(response.data.message || 'Мониторинг запущен');
      await fetchMentions();
      if (response.data.keywords) {
        setKeywords(response.data.keywords);
      }
    } catch (error) {
      message.error('Ошибка мониторинга: ' + (error.response?.data?.message || error.message));
    } finally {
      setMonitoring(false);
    }
  };

  const openModal = (imageUrl, altText) => {
    setModalData({
      isOpen: true,
      imageUrl,
      altText
    });
  };

  return (
    <div className="app">
      <Spin
        spinning={loading}
        indicator={<CoolLoader />}
        tip="Загрузка данных..."
        size="large"
      >
        <div className='container'>
          {error ? (
            <div style={{ padding: '20px' }}>
              <Alert
                message="Ошибка загрузки данных"
                description={
                  <Space direction="vertical">
                    <Text>{error}</Text>
                    <Button type="primary" onClick={handleRetry}>
                      Попробовать снова
                    </Button>
                  </Space>
                }
                type="error"
                showIcon
              />
            </div>
          ) : (
            <>
              <div className="app-header">
                <h1>📊 Мониторинг соцсетей</h1>

                <HealthStatus health={health} mentionsCount={displayMentions.length} />

                <KeywordsManager
                  keywords={keywords}
                  onKeywordsChange={setKeywords}
                />

                <GroupsManager
                  groups={groups}
                  onGroupsChange={handleGroupsChange}
                />
              </div>

              <SimpleDaysFilter
                mentions={mentions}
                onFilterApplied={handleFilterApplied}
              />

              <MentionsList
                mentions={displayMentions}
                keywords={keywords}
                onRunMonitoring={runMonitoring}
                monitoring={monitoring}
                onOpenModal={openModal}
              />
            </>
          )}
        </div>
      </Spin>
    </div>
  );
}
export default App;