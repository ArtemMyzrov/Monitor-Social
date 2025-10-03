import { Card, Tag, Typography, Image, } from 'antd';
import {
    EyeOutlined,
    MessageOutlined,
    ClockCircleOutlined,
} from '@ant-design/icons';

import HighlightedText from '../highlighting/HighlightedText';
import Comment from '../сomment/Comment';
import AttachmentsSection from './AttachmentsSection';
import StatsSection from './StatsSection';
import AuthorInfo from './AuthorInfo';

const { Text } = Typography;

const MentionCard = ({ mention, keywords, onOpenModal }) => {
    const formatDate = (dateString) => {
        if (!dateString) return 'Нет данных';
        return new Date(dateString).toLocaleString('ru-RU');
    };

    const getSourceColor = (source) => {
        if (source && source.includes('VK')) return '#4a76a8';
        if (source && source.includes('Telegram')) return '#0088cc';
        if (source && source.includes('RSS')) return '#ffa500';
        return 'gray';
    };

    return (
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
                    <AuthorInfo author={mention.author} />
                </div>
                <Text type="secondary">
                    <ClockCircleOutlined /> {formatDate(mention.date)}
                </Text>
            </div>

            <StatsSection
                likes={mention.likes}
                reposts={mention.reposts}
                views={mention.views}
                commentsCount={mention.comments_count}
            />

            {mention.imageUrl && (
                <div className="mention-image">
                    <Image
                        src={mention.imageUrl}
                        alt="Упоминание"
                        preview={false}
                        onClick={() => onOpenModal(mention.imageUrl, 'Упоминание')}
                    />
                </div>
            )}

            <AttachmentsSection
                attachments={mention.attachments}
                onOpenModal={onOpenModal}
            />

            <div className="mention-content">
                <HighlightedText text={mention.text} keywords={keywords} />
            </div>

            {mention.geo && (
                <div className="geo-info">
                    <strong>Местоположение:</strong> {mention.geo.title}
                    {mention.geo.address && ` (${mention.geo.address})`}
                </div>
            )}

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
    );
};

export default MentionCard;