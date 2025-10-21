import { useState, useEffect } from 'react';
import { FloatButton } from 'antd';
import { DownOutlined, UpOutlined } from '@ant-design/icons';
import "./ScrollToButton.css";

const ScrollToButton = () => {
    const [isAtBottom, setIsAtBottom] = useState(false);
    const [showButton, setShowButton] = useState(false);

    useEffect(() => {
        const checkScrollPosition = () => {
            const scrollTop = window.scrollY || document.documentElement.scrollTop;
            const windowHeight = window.innerHeight;
            const documentHeight = document.documentElement.scrollHeight;
            const atBottom = scrollTop + windowHeight >= documentHeight - 100;
            setIsAtBottom(atBottom);

            setShowButton(scrollTop > 100);
        };

        window.addEventListener('scroll', checkScrollPosition);
        checkScrollPosition();

        return () => window.removeEventListener('scroll', checkScrollPosition);
    }, []);


    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const scrollToBottom = () => {
        window.scrollTo({
            top: document.body.scrollHeight,
            behavior: 'smooth'
        });
    };

    if (!showButton) {
        return null;
    }

    return (
        <FloatButton
            icon={isAtBottom ? <UpOutlined /> : <DownOutlined />}
            type="primary"
            style={{
                right: 24,
                bottom: 24,
            }}
            onClick={isAtBottom ? scrollToTop : scrollToBottom}
            tooltip={isAtBottom ? "Вверх" : "Вниз"}
            className='scroll-btn'
        />
    );
};

export default ScrollToButton;