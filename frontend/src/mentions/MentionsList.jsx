import { List, Button, Empty } from 'antd';
import { PlayCircleOutlined } from '@ant-design/icons';
import MentionCard from './MentionCard';


const MentionsList = ({ mentions, keywords, onRunMonitoring, monitoring, onOpenModal }) => {
    if (mentions.length === 0) {
        return (
            <div className="mentions-section">
                <h2>Найденные упоминания</h2>
                <div style={{ textAlign: 'center', padding: '40px' }}>
                    <Empty
                        description="Упоминаний не найдено"
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                    />
                    <Button
                        type="primary"
                        icon={<PlayCircleOutlined />}
                        loading={monitoring}
                        onClick={onRunMonitoring}
                        style={{ marginTop: '16px' }}
                    >
                        Запустить мониторинг
                    </Button>
                </div>
            </div>
        );
    }

    return (
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
                        <MentionCard
                            mention={mention}
                            keywords={keywords}
                            onOpenModal={onOpenModal}
                        />
                    </List.Item>
                )}
            />
        </div>
    );
};

export default MentionsList;