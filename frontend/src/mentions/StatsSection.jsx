import { Space } from 'antd';
import { LikeOutlined, ShareAltOutlined, MessageOutlined, EyeOutlined } from '@ant-design/icons';

const StatsSection = ({ likes, reposts, views, commentsCount }) => (
    <div className="mention-stats">
        <Space size="middle">
            <span className="stat-item">
                <LikeOutlined /> {likes || 0}
            </span>
            <span className="stat-item">
                <ShareAltOutlined /> {reposts || 0}
            </span>
            <span className="stat-item">
                <EyeOutlined /> {views || 0}
            </span>
            <span className="stat-item">
                <MessageOutlined /> {commentsCount || 0}
            </span>
        </Space>
    </div>
);

export default StatsSection;