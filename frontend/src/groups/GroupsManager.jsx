import { useState } from 'react';
import {
    Card,
    Tag,
    Input,
    Button,
    Space,
    message,
    Typography,
    Modal
} from 'antd';
import {
    EditOutlined,
    SaveOutlined,
    DeleteOutlined
} from '@ant-design/icons';

const { TextArea } = Input;
const { Text } = Typography;
const { confirm } = Modal;

const GroupsManager = ({
    groups = [],
    onGroupsChange,
    loading = false,
    title = "Группы для мониторинга"
}) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editText, setEditText] = useState('');

    // Сохранение групп в текстовом формате
    const saveGroups = () => {
        try {
            const groupsArray = editText.split('\n')
                .map(line => {
                    const parts = line.split('|');
                    if (parts.length === 2 && parts[0].trim() && parts[1].trim()) {
                        return {
                            screenName: parts[0].trim(),
                            name: parts[1].trim()
                        };
                    }
                    return null;
                })
                .filter(group => group !== null);

            if (groupsArray.length === 0) {
                message.warning('Добавьте хотя бы одну группу');
                return;
            }

            onGroupsChange?.(groupsArray);
            setIsEditing(false);
            message.success('Группы обновлены!');
        } catch (error) {
            message.error('Ошибка сохранения групп');
        }
    };

    // Удаление группы
    const removeGroup = (screenName) => {
        confirm({
            title: 'Удалить группу?',
            content: 'Группа будет удалена из списка мониторинга',
            okText: 'Удалить',
            cancelText: 'Отмена',
            onOk() {
                const newGroups = groups.filter(group => group.screenName !== screenName);
                onGroupsChange?.(newGroups);
                message.success('Группа удалена!');
            }
        });
    };

    return (
        <Card
            title={
                <Space>
                    <span>{title}</span>
                    <span style={{ fontSize: '12px', color: '#666' }}>
                        ({groups.length} групп)
                    </span>
                </Space>
            }
            style={{ marginBottom: 16 }}
            loading={loading}
            extra={
                <Button
                    type="text"
                    icon={<EditOutlined />}
                    onClick={() => {
                        setIsEditing(true);
                        setEditText(groups.map(g => `${g.screenName}|${g.name}`).join('\n'));
                    }}
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
                        rows={6}
                        placeholder="Введите группы в формате: screen_name|Название группы&#10;Пример: saratov.life|Саратов Life"
                    />
                    <Space>
                        <Button type="primary" icon={<SaveOutlined />} onClick={saveGroups}>
                            Сохранить
                        </Button>
                        <Button onClick={() => setIsEditing(false)}>
                            Отмена
                        </Button>
                    </Space>
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                        💡 Каждая группа с новой строки в формате: screen_name|Название
                    </Text>
                </Space>
            ) : (
                <div>
                    {groups.length === 0 ? (
                        <Text type="secondary">Группы не добавлены</Text>
                    ) : (
                        groups.map((group) => (
                            <Tag
                                key={group.screenName}
                                color="blue"
                                style={{
                                    margin: '4px',
                                    padding: '4px 8px',
                                    fontSize: '13px'
                                }}
                                closable
                                onClose={() => removeGroup(group.screenName)}
                            >
                                <Space size="small">
                                    <span>{group.name}</span>
                                    <Text type="secondary" style={{ fontSize: '11px' }}>
                                        @{group.screenName}
                                    </Text>
                                </Space>
                            </Tag>
                        ))
                    )}
                </div>
            )}
        </Card>
    );
};

export default GroupsManager;