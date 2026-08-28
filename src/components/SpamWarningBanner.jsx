import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';

import { Icon, PageBanner } from '@openedx/paragon';
import { Warning } from '@openedx/paragon/icons';

import { useIntl } from '@edx/frontend-platform/i18n';

import messages from '../discussions/messages';

const SPAM_WARNING_DISMISSED_KEY = 'discussions.spamWarningDismissed';

const SpamWarningBanner = ({ className = '' }) => {
  const intl = useIntl();
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    try {
      const dismissed = localStorage.getItem(SPAM_WARNING_DISMISSED_KEY);
      setIsDismissed(dismissed === 'true');
    } catch (e) {
      setIsDismissed(false);
    }
  }, []);

  const handleDismiss = () => {
    try {
      localStorage.setItem(SPAM_WARNING_DISMISSED_KEY, 'true');
      setIsDismissed(true);
    } catch (e) {
      setIsDismissed(true);
    }
  };

  if (isDismissed) {
    return null;
  }

  return (
    <PageBanner
      variant="warning"
      show={!isDismissed}
      dismissible={false}
      className={`spam-warning-banner ${className}`}
    >
      <div className="spam-warning-content">
        <span className="spam-warning-text">
          <Icon
            src={Warning}
            className="spam-warning-icon"
          />
          <span className="spam-warning-message">
            <strong>{intl.formatMessage(messages.spamWarningHeading)}:</strong>{' '}
            {(() => {
              const msg = intl.formatMessage(messages.spamWarningMessage);
              const boldText = 'never invite you to join external groups, such as on WhatsApp, or ask for personal or financial information';
              const idx = msg.indexOf(boldText);
              if (idx === -1) {
                return msg;
              }
              return (
                <>
                  {msg.slice(0, idx)}
                  <strong>{boldText}</strong>
                  {msg.slice(idx + boldText.length)}
                </>
              );
            })()}
          </span>
        </span>
        <button
          type="button"
          onClick={handleDismiss}
          className="spam-warning-close-btn"
          aria-label="Close warning"
        >
          ×
        </button>
      </div>
    </PageBanner>
  );
};

SpamWarningBanner.propTypes = {
  className: PropTypes.string,
};

export default SpamWarningBanner;
