import { useState } from 'react';
import { Card, Button, Space, Tag, Input, Typography, message } from 'antd';
import { EditOutlined, SaveOutlined } from '@ant-design/icons';
import axios from 'axios';

const { TextArea } = Input;
const { Text } = Typography;

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

    return (
        <Card
            title={
                <Space>
                    <span>Ключевые слова для поиска</span>
                    <Button
                        type="text"
                        icon={<EditOutlined />}
                        size="small"
                        onClick={startEditing}
                    />
                </Space>
            }
            style={{ marginBottom: 16 }}
            loading={loading}
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
    );
};

export default KeywordsManager;