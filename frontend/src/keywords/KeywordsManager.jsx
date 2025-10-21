import { useState } from 'react';
import { Card, Button, Space, Tag, Input, Typography, message, Modal } from 'antd';
import { EditOutlined, SaveOutlined, DeleteOutlined, CloseOutlined } from '@ant-design/icons';

const { TextArea } = Input;
const { Text } = Typography;
const { confirm } = Modal;

const KeywordsManager = ({ keywords, onKeywordsChange }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editText, setEditText] = useState('');
    const [loading, setLoading] = useState(false);

    const startEditing = () => {
        setIsEditing(true);
        setEditText(keywords.join('\n'));
    };

    const saveKeywords = async () => {
        try {
            setLoading(true);
            const newKeywords = editText.split('\n')
                .map(k => k.trim())
                .filter(k => k.length > 0);

            try {
                await axios.put('/api/keywords', { keywords: newKeywords });
            } catch (serverError) {
                console.log('Endpoint /api/keywords еще не реализован, сохраняем локально');
            }

            onKeywordsChange(newKeywords);
            setIsEditing(false);
            message.success('Ключевые слова обновлены!');
        } catch (error) {
            message.error('Ошибка сохранения ключевых слов');
        } finally {
            setLoading(false);
        }
    };

    const cancelEditing = () => {
        setIsEditing(false);
        setEditText('');
    };

    // Удаление одного ключевого слова
    const removeKeyword = (keywordToRemove) => {
        confirm({
            title: 'Удалить ключевое слово?',
            content: `Вы уверены, что хотите удалить "${keywordToRemove}"?`,
            okText: 'Удалить',
            cancelText: 'Отмена',
            okType: 'danger',
            onOk() {
                const newKeywords = keywords.filter(keyword => keyword !== keywordToRemove);
                onKeywordsChange(newKeywords);
                message.success('Ключевое слово удалено!');
            }
        });
    };

    return (
        <Card
            title={
                <Space>
                    <span>Ключевые слова для поиска</span>
                    <span style={{ fontSize: '12px', color: '#666' }}>
                        ({keywords.length} слов)
                    </span>
                </Space>
            }
            style={{ marginBottom: 16 }}
            loading={loading}
            extra={
                <Button
                    type="text"
                    icon={<EditOutlined />}
                    onClick={startEditing}
                >
                    Редактировать
                </Button>
            }
        >
            {isEditing ? (
                <Space direction="vertical" style={{ width: '100%' }}>
                    <TextArea
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        rows={4}
                        placeholder="Введите ключевые слова, каждое с новой строки"
                    />
                    <Space>
                        <Button
                            type="primary"
                            icon={<SaveOutlined />}
                            onClick={saveKeywords}
                            loading={loading}
                        >
                            Сохранить
                        </Button>
                        <Button onClick={cancelEditing}>
                            Отмена
                        </Button>
                    </Space>
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                        💡 Каждое ключевое слово должно быть на новой строке
                    </Text>
                </Space>
            ) : (
                <div>
                    {keywords.length === 0 ? (
                        <Text type="secondary">Ключевые слова не заданы</Text>
                    ) : (
                        keywords.map((keyword, index) => (
                            <Tag
                                key={index}
                                color="blue"
                                style={{
                                    margin: '4px',
                                    padding: '4px 8px',
                                    fontSize: '13px',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '4px'
                                }}
                                closable
                                onClose={() => removeKeyword(keyword)}
                                closeIcon={
                                    <CloseOutlined
                                        style={{
                                            fontSize: '10px',
                                            marginLeft: '2px'
                                        }}
                                    />
                                }
                            >
                                {keyword}
                            </Tag>
                        ))
                    )}
                </div>
            )}
        </Card>
    );
};

export default KeywordsManager;