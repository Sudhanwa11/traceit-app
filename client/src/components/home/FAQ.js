import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import './FAQ.css';

const FAQ = () => {
  const { t } = useTranslation();
  const [activeIndex, setActiveIndex] = useState(null);

  // Define FAQs here (can also be in i18n JSON for translations)
  const faqItems = [
    {
      q: "How does the AI matching work?",
      a: "Our system converts your item details (title, description, location, category, photo) into special numeric codes called embeddings. It compares them across all items in the database to find the most semantically similar matches, not just keyword matches. English and Hindi descriptions are supported equally."
    },
    {
      q: "Is my personal information safe?",
      a: "Yes. Only your name, department, and item details are shared during claims. Contact details are never exposed publicly. Chat and embeddings run securely, and all sensitive data is stored with protection."
    },
    {
      q: "What happens after I claim an item?",
      a: "When you claim a matched item, the reporter is notified. If they approve, a secure chat opens where you can verify ownership (e.g., unique marks). After successful handover, the reporter marks the item as resolved and you confirm retrieval. The item is then removed from Matches."
    },
    {
      q: "How do I earn service points?",
      a: "When a reporter successfully returns a found item and the claimer confirms retrieval, the reporter automatically earns +100 Service Points. These points reflect your helpfulness to the campus community."
    },
    {
      q: "What if I don’t see any matches?",
      a: "Try adding a clearer title, detailed description, or uploading a photo. You can also refresh Matches manually with the 'Search matches now' button. New reports are continuously processed by the AI."
    },
    {
      q: "What if my chat request is rejected?",
      a: "If the reporter rejects your chat request, you can still claim other items. Rejections usually mean the reporter believes the item doesn’t match your description."
    },
    {
      q: "Where should we meet for item handover?",
      a: "For safety, always meet in public campus spaces such as the library front desk or administrative offices. Verify ownership politely before handing over."
    }
  ];

  const onQuestionClick = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <section className="faq-section">
      <h3>{t('faq.title', 'Frequently Asked Questions')}</h3>
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
