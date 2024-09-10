import React from 'react';
import PropTypes from 'prop-types';

import { Alert } from '@openedx/paragon';

import { useIntl } from '@edx/frontend-platform/i18n';

import messages from '../post-comments/messages';
import AuthorLabel from './AuthorLabel';

const AlertBar = ({
  message,
  author,
  authorLabel,
  labelColor,
  reason,
}) => {
  const intl = useIntl();

  return (
    <Alert variant="info" className="px-3 shadow-none mb-1 py-10px bg-light-200">
      <div className="d-flex align-items-center flex-wrap text-gray-700 font-style">
        {message}
        <span className="ml-1">
          <AuthorLabel
            author={author}
            authorLabel={authorLabel}
            labelColor={labelColor}
            linkToProfile
            postOrComment
          />
        </span>
        <span
          className="mr-1.5 font-size-8 font-style text-light-700"
          style={{ lineHeight: '15px' }}
        >
          {intl.formatMessage(messages.fullStop)}
        </span>
        {reason && (`${intl.formatMessage(messages.reason)}: ${reason}`)}
      </div>
    </Alert>
  );
};

AlertBar.propTypes = {
  message: PropTypes.string,
  author: PropTypes.string,
  authorLabel: PropTypes.string,
  labelColor: PropTypes.string,
  reason: PropTypes.string,
};

AlertBar.defaultProps = {
  message: '',
  author: '',
  authorLabel: '',
  labelColor: '',
  reason: '',
};

export default React.memo(AlertBar);
