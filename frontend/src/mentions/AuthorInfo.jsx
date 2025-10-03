import { Avatar } from 'antd';
import { UserOutlined } from '@ant-design/icons';

const AuthorInfo = ({ author }) => {
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

export default AuthorInfo;