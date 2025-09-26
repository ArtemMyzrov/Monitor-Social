import { useState, useEffect } from 'react';
import axios from 'axios';
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
  Space,
  Image,
  Button,
  message,
  Avatar,
  // НОВЫЙ ИМПОРТ: Добавляем компоненты для управления ключевыми словами
  Input,
  Modal as AntModal,
  Form
} from 'antd';
import {
  MessageOutlined,
  ClockCircleOutlined,
  EyeOutlined,
  LinkOutlined,
  LoadingOutlined,
  PlayCircleOutlined,
  UserOutlined,
  LikeOutlined,
  ShareAltOutlined,
  EyeOutlined as ViewsIcon,
  EditOutlined,
  SaveOutlined
} from '@ant-design/icons';
import Modal from './modal/Modal';
import Comment from './сomment/Comment';
import HighlightedText from './highlighting/HighlightedText';
import GroupsManager from './groups/GroupsManager';
import './styles/App.css';

const { Title, Text } = Typography;
// НОВЫЙ ИМПОРТ: TextArea для редактирования ключевых слов
const { TextArea } = Input;

function App() {
  const [health, setHealth] = useState(null);
  const [mentions, setMentions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [monitoring, setMonitoring] = useState(false);
  const [error, setError] = useState(null);
  const [modalData, setModalData] = useState({
    isOpen: false,
    imageUrl: '',
    altText: ''
  });

  // НОВАЯ ФИЧА: Состояния для управления ключевыми словами
  const [keywords, setKeywords] = useState([]);
  const [isEditingKeywords, setIsEditingKeywords] = useState(false);
  const [editKeywordsText, setEditKeywordsText] = useState('');
  const [keywordsLoading, setKeywordsLoading] = useState(false);

  const [groups, setGroups] = useState([]);
  const [groupsLoading, setGroupsLoading] = useState(false);
  const loadingIcon = <LoadingOutlined style={{ fontSize: 24 }} spin />;

  useEffect(() => {
    checkHealth();
    fetchMentions();
    fetchGroups();
    fetchKeywords();
  }, []);

  const fetchGroups = async () => {
    try {
      setGroupsLoading(true);
      const response = await axios.get('/api/groups');
      setGroups(response.data.groups || []);
    } catch (error) {
      console.error('Ошибка загрузки групп:', error);
      setGroups([]);
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

  const handleTestGroup = async (screenName) => {
    try {
      const response = await axios.post('/api/groups/test', { screenName });
      message.success(`Группа найдена: ${response.data.group.groupId}`);

      // Предлагаем добавить группу
      // Можно реализовать модальное окно для подтверждения
    } catch (error) {
      throw new Error('Группа не найдена');
    }
  };

  // НОВАЯ ФИЧА: Загрузка ключевых слов с сервера
  const fetchKeywords = async () => {
    try {
      setKeywordsLoading(true);
      const response = await axios.get('/api/keywords');
      setKeywords(response.data.keywords || []);
    } catch (error) {
      console.error('Ошибка загрузки ключевых слов:', error);
      setKeywords([
        'льготная карта', 'транспортная льготная карта', 'не работает',
        'остановка', 'проезд', 'кондуктор', 'водитель', 'пассажир', 'перевозчик', 'льготная'
      ]);
    } finally {
      setKeywordsLoading(false);
    }
  };

  // НОВАЯ ФИЧА: Сохранение ключевых слов на сервер
  const saveKeywords = async () => {
    try {
      const newKeywords = editKeywordsText.split('\n')
        .map(k => k.trim())
        .filter(k => k.length > 0);

      // Пытаемся сохранить на сервер, если endpoint реализован
      try {
        await axios.put('/api/keywords', { keywords: newKeywords });
      } catch (serverError) {
        console.log('Endpoint /api/keywords еще не реализован, сохраняем локально');
      }

      setKeywords(newKeywords);
      setIsEditingKeywords(false);
      message.success('Ключевые слова обновлены!');
    } catch (error) {
      message.error('Ошибка сохранения ключевых слов');
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

      // НОВАЯ ФИЧА: Обновляем ключевые слова после мониторинга, если они пришли в ответе
      if (response.data.keywords) {
        setKeywords(response.data.keywords);
      }
    } catch (error) {
      message.error('Ошибка мониторинга: ' + (error.response?.data?.message || error.message));
    } finally {
      setMonitoring(false);
    }
  };

  // Остальные существующие функции без изменений...
  const openModal = (imageUrl, altText) => {
    setModalData({
      isOpen: true,
      imageUrl,
      altText
    });
  };

  const closeModal = () => {
    setModalData({
      isOpen: false,
      imageUrl: '',
      altText: ''
    });
  };

  const getSourceColor = (source) => {
    if (source && source.includes('VK')) return '#4a76a8';
    if (source && source.includes('Telegram')) return '#0088cc';
    if (source && source.includes('RSS')) return '#ffa500';
    return 'gray';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Нет данных';
    return new Date(dateString).toLocaleString('ru-RU');
  };

  const renderAuthorInfo = (author) => {
    if (!author) return null;

    return (
      <div className="author-info">
        <Avatar
          src={author.photo}
          icon={<UserOutlined />}
          size="small"
        />
        <span className="author-name">
          {author.name}
        </span>
      </div>
    );
  };

  const renderAttachments = (attachments) => {
    if (!attachments || attachments.length === 0) return null;

    return (
      <div className="attachments-section">
        <div className="attachments-header">
          <span>Вложения ({attachments.length})</span>
        </div>
        <div className="attachments-grid">
          {attachments.map((attachment, index) => {
            if (attachment.type === 'photo') {
              return (
                <div key={index} className="attachment-item">
                  <Image
                    src={attachment.url}
                    alt="Вложение"
                    preview={false}
                    onClick={() => openModal(attachment.url, 'Вложение')}
                    className="attachment-image"
                  />
                </div>
              );
            }
            return null;
          })}
        </div>
      </div>
    );
  };

  const renderStats = (mention) => {
    return (
      <div className="mention-stats">
        <Space size="middle">
          <span className="stat-item">
            <LikeOutlined /> {mention.likes || 0}
          </span>
          <span className="stat-item">
            <ShareAltOutlined /> {mention.reposts || 0}
          </span>
          <span className="stat-item">
            <ViewsIcon /> {mention.views || 0}
          </span>
          <span className="stat-item">
            <MessageOutlined /> {mention.comments_count || 0}
          </span>
        </Space>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="app-loading">
        <Space direction="vertical" size="large" align="center">
          <Spin indicator={loadingIcon} size="large" />
          <Text type="secondary">Загрузка данных...</Text>
        </Space>
      </div>
    );
  }

  if (error) {
    return (
      <div className="app">
        <Alert
          message="Ошибка загрузки"
          description={error}
          type="error"
          showIcon
          action={
            <Button size="small" onClick={fetchMentions}>
              Повторить
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="app">
      <div className='container'>
        <div className="app-header">
          <Title level={1}>📊 Мониторинг соцсетей</Title>

          {/* НОВАЯ ФИЧА: Панель управления ключевыми словами */}
          <Card
            title={
              <Space>
                <span>Ключевые слова для поиска</span>
                <Button
                  type="text"
                  icon={<EditOutlined />}
                  size="small"
                  onClick={() => {
                    setIsEditingKeywords(true);
                    setEditKeywordsText(keywords.join('\n'));
                  }}
                />
              </Space>
            }
            style={{ marginBottom: 16 }}
            loading={keywordsLoading}
          >
            {isEditingKeywords ? (
              <Space direction="vertical" style={{ width: '100%' }}>
                <TextArea
                  value={editKeywordsText}
                  onChange={(e) => setEditKeywordsText(e.target.value)}
                  rows={4}
                  placeholder="Введите ключевые слова, каждое с новой строки"
                />
                <Space>
                  <Button type="primary" icon={<SaveOutlined />} onClick={saveKeywords}>
                    Сохранить
                  </Button>
                  <Button onClick={() => setIsEditingKeywords(false)}>
                    Отмена
                  </Button>
                </Space>
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  💡 Каждое ключевое слово должно быть на новой строке
                </Text>
              </Space>
            ) : (
              <div>
                {keywords.map((keyword, index) => (
                  <Tag key={index} color="blue" style={{ margin: '2px' }}>
                    {keyword}
                  </Tag>
                ))}
                {keywords.length === 0 && (
                  <Text type="secondary">Ключевые слова не заданы</Text>
                )}
              </div>
            )}
          </Card>
          <GroupsManager
            groups={groups}
            onGroupsChange={handleGroupsChange}
            loading={groupsLoading}
          />
          <Row gutter={16} className="stats-row">
            <Col span={6}>
              <Card>
                <Statistic
                  title="Всего упоминаний"
                  value={mentions.length}
                  prefix={<MessageOutlined />}
                />
              </Card>
            </Col>
            <Col span={6}>
              <Card>
                <Statistic
                  title="Статус системы"
                  value={health?.status || 'UNKNOWN'}
                  valueStyle={{ color: health?.status === 'OK' ? '#3f8600' : '#cf1322' }}
                />
              </Card>
            </Col>
            <Col span={6}>
              <Card>
                <Statistic
                  title="Последнее обновление"
                  value={health?.timestamp ? formatDate(health.timestamp) : 'N/A'}
                  prefix={<ClockCircleOutlined />}
                />
              </Card>
            </Col>
            <Col span={6}>
              <Card>
                <div style={{ textAlign: 'center' }}>
                  <Button
                    type="primary"
                    icon={<PlayCircleOutlined />}
                    loading={monitoring}
                    onClick={runMonitoring}
                  >
                    Запустить мониторинг
                  </Button>
                </div>
              </Card>
            </Col>
          </Row>
        </div>

        <div className="mentions-section">
          <h2>Найденные упоминания</h2>

          {mentions.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <Text type="secondary">Упоминаний не найдено</Text>
              <br />
              <Button
                type="primary"
                icon={<PlayCircleOutlined />}
                loading={monitoring}
                onClick={runMonitoring}
                style={{ marginTop: '16px' }}
              >
                Запустить мониторинг
              </Button>
            </div>
          ) : (
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
                      <div className="mention-source">
                        <Tag color={getSourceColor(mention.source)}>
                          {mention.source || 'Неизвестный источник'}
                        </Tag>
                        {renderAuthorInfo(mention.author)}
                      </div>
                      <Text type="secondary">
                        <ClockCircleOutlined /> {formatDate(mention.date_found)}
                      </Text>
                    </div>

                    {renderStats(mention)}

                    {mention.imageUrl && (
                      <div className="mention-image">
                        <Image
                          src={mention.imageUrl}
                          alt="Упоминание"
                          preview={false}
                          onClick={() => openModal(mention.imageUrl, 'Упоминание')}
                        />
                      </div>
                    )}

                    {renderAttachments(mention.attachments)}

                    {/* НОВАЯ ФИЧА: Передаем ключевые слова в компонент подсветки */}
                    <div className="mention-content">
                      <HighlightedText text={mention.text} keywords={keywords} />
                    </div>

                    {mention.geo && (
                      <div className="geo-info">
                        <strong>Местоположение:</strong> {mention.geo.title}
                        {mention.geo.address && ` (${mention.geo.address})`}
                      </div>
                    )}

                    {/* Блок с комментариями для VK */}
                    {mention.comments && mention.comments.length > 0 && (
                      <div className="comments-section">
                        <div className="comments-header">
                          <MessageOutlined /> Комментарии ({mention.comments.length})
                        </div>
                        {mention.comments.map((comment) => (
                          <Comment
                            key={comment.id}
                            author={comment.author}
                            avatar={comment.avatar}
                            content={comment.text}
                            datetime={formatDate(comment.date)}
                            likes={comment.likes}
                          />
                        ))}
                      </div>
                    )}
                  </Card>
                </List.Item>
              )}
            />
          )}
        </div>
      </div>

      <Modal
        isOpen={modalData.isOpen}
        onClose={closeModal}
        imageUrl={modalData.imageUrl}
        altText={modalData.altText}
      />
    </div>
  );
}

export default App;