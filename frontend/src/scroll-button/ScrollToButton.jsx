import { useState, useEffect, useRef, useCallback } from 'react';
import { FloatButton } from 'antd';
import { DownOutlined, UpOutlined } from '@ant-design/icons';
import './ScrollToButton.css';

const ScrollToButton = () => {
    const [scrollDirection, setScrollDirection] = useState('down');
    const [showButton, setShowButton] = useState(false);
    const lastScrollY = useRef(0);
    const ticking = useRef(false);

    const updateScrollDirection = useCallback(() => {
        const scrollTop = window.scrollY || document.documentElement.scrollTop;

        if (Math.abs(scrollTop - lastScrollY.current) > 5) { // Минимальное изменение
            if (scrollTop > lastScrollY.current) {
                setScrollDirection('down');
            } else {
                setScrollDirection('up');
            }
        }

        lastScrollY.current = scrollTop;
        setShowButton(scrollTop > 100);
        ticking.current = false;
    }, []);

    const handleScroll = useCallback(() => {
        if (!ticking.current) {
            requestAnimationFrame(updateScrollDirection);
            ticking.current = true;
        }
    }, [updateScrollDirection]);

    useEffect(() => {
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, [handleScroll]);

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const scrollToBottom = () => {
        window.scrollTo({
            top: document.body.scrollHeight,
            behavior: 'smooth'
        });
    };

    const handleButtonClick = () => {
        if (scrollDirection === 'up') {
            scrollToTop();
        } else {
            scrollToBottom();
        }
    };

    const getButtonIcon = () => {
        return scrollDirection === 'up' ? <UpOutlined /> : <DownOutlined />;
    };

    const getButtonTooltip = () => {
        return scrollDirection === 'up' ? "Вверх" : "Вниз";
    };

    if (!showButton) {
        return null;
    }

    return (
        <FloatButton
            icon={getButtonIcon()}
            type="primary"
            style={{
                right: 24,
                bottom: 24,
            }}
            onClick={handleButtonClick}
            tooltip={getButtonTooltip()}
            className={`scroll-btn scroll-btn-${scrollDirection}`}
        />
    );
};

export default ScrollToButton;