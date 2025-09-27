// client/src/components/home/FAQ.js
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import './FAQ.css';

const FAQ = () => {
    const { t } = useTranslation();
    const [activeIndex, setActiveIndex] = useState(null);

    const faqItems = t('faq.items', { returnObjects: true });

    const onQuestionClick = (index) => {
        setActiveIndex(activeIndex === index ? null : index);
    };

    return (
        <section className="faq-section">
            <h3>{t('faq.title')}</h3>
            <div className="faq-accordion">
                {faqItems.map((item, index) => (
                    <div key={index} className="faq-item">
                        <div 
                            className={`faq-question ${activeIndex === index ? 'active' : ''}`}
                            onClick={() => onQuestionClick(index)}
                        >
                            {item.q}
                            <span className="faq-icon">{activeIndex === index ? '-' : '+'}</span>
                        </div>
                        <div className={`faq-answer ${activeIndex === index ? 'open' : ''}`}>
                            <p>{item.a}</p>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default FAQ;