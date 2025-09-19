import { Avatar, Tooltip } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import './Comment.css';

const Comment = ({ author, avatar, content, datetime }) => {
  return (
    <div className="comment">
      <div className="comment-avatar">
        <Avatar src={avatar} icon={<UserOutlined />} />
      </div>
      <div className="comment-content">
        <div className="comment-author">
          {author}
          <span className="comment-datetime">
            <Tooltip title={datetime}>
              <span>{datetime}</span>
            </Tooltip>
          </span>
        </div>
        <div className="comment-text">
          {content}
        </div>
      </div>
    </div>
  );
};

export default Comment;