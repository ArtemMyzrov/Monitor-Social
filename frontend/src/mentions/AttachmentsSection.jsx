import { Image } from 'antd';

const AttachmentsSection = ({ attachments, onOpenModal }) => {
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
                                    onClick={() => onOpenModal(attachment.url, 'Вложение')}
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

export default AttachmentsSection;