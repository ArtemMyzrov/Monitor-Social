// components/SimpleDaysFilter.jsx
import React, { useState } from 'react';
import { Card, Button, Space, message } from 'antd';
import { HistoryOutlined } from '@ant-design/icons';
import axios from 'axios';

const SimpleDaysFilter = ({ onFilterApplied }) => {
    const [loading, setLoading] = useState(false);
    const [activePeriod, setActivePeriod] = useState(null);

    // Массив с предустановленными периодами
    const quickPeriods = [
        { label: 'За последние 7 дней', days: 7 },
        { label: 'За последние 14 дней', days: 14 },
        { label: 'За последние 30 дней', days: 30 }
    ];

    const handlePeriodClick = async (days) => {
        setLoading(true);
        setActivePeriod(days);
        try {
            const response = await axios.post('/api/vk/monitor-by-days', { days });
            message.success(response.data.message);

            // Если передан колбэк, вызываем его с результатами
            if (onFilterApplied) {
                onFilterApplied(response.data.posts);
            }

        } catch (error) {
            console.error('Ошибка при фильтрации:', error);
            message.error('Ошибка при загрузке данных: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card
            title={
                <Space>
                    <HistoryOutlined />
                    <span>Быстрый фильтр по периоду</span>
                </Space>
            }
            style={{ marginBottom: 16 }}
            size="small"
        >
            <Space direction="vertical" style={{ width: '100%' }} size="small">
                <span style={{ fontSize: '12px', color: '#666' }}>
                    Выберите период для поиска упоминаний:
                </span>
                <Space wrap>
                    {quickPeriods.map(period => (
                        <Button
                            key={period.days}
                            type={activePeriod === period.days ? 'primary' : 'default'}
                            onClick={() => handlePeriodClick(period.days)}
                            loading={loading && activePeriod === period.days}
                            size="small"
                        >
                            {period.label}
                        </Button>
                    ))}
                </Space>
            </Space>
        </Card>
    );
};

export default SimpleDaysFilter;