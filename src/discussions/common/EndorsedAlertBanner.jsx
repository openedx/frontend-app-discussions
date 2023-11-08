import React from 'react';
import PropTypes from 'prop-types';

import * as timeago from 'timeago.js';

import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { Alert, Icon } from '@edx/paragon';
import { CheckCircle, Verified } from '@edx/paragon/icons';

import { ThreadType } from '../../data/constants';
import { commentShape } from '../post-comments/comments/comment/proptypes';
import messages from '../post-comments/messages';
import AuthorLabel from './AuthorLabel';
import timeLocale from './time-locale';

const EndorsedAlertBanner = ({
  intl,
  content,
  postType,
}) => {
  timeago.register('time-locale', timeLocale);
  const isQuestion = postType === ThreadType.QUESTION;
  const classes = isQuestion ? 'bg-success-500 text-white' : 'bg-dark-500 text-white';
  const iconClass = isQuestion ? CheckCircle : Verified;

  return (
    content.endorsed && (
      <Alert
        variant="plain"
        className={`px-2.5 mb-0 py-8px align-items-center shadow-none ${classes}`}
        style={{ borderRadius: '0.375rem 0.375rem 0 0' }}
      >
        <div className="d-flex justify-content-between flex-wrap">
          <div className="d-flex align-items-center">
            <Icon
              src={iconClass}
              style={{
                width: '21px',
                height: '20px',
              }}
            />
            <strong className="ml-2">
              {intl.formatMessage(isQuestion ? messages.answer : messages.endorsed)}
            </strong>
          </div>
          <span className="d-flex align-items-center align-items-center flex-wrap" style={{ marginRight: '-1px' }}>
            <AuthorLabel
              author={content.endorsedBy}
              authorLabel={content.endorsedByLabel}
              linkToProfile
              alert={content.endorsed}
              postCreatedAt={content.endorsedAt}
              authorToolTip
              postOrComment
            />
          </span>
        </div>
      </Alert>
    )
  );
};

EndorsedAlertBanner.propTypes = {
  intl: intlShape.isRequired,
  content: PropTypes.oneOfType([commentShape.isRequired]).isRequired,
  postType: PropTypes.string,
};

EndorsedAlertBanner.defaultProps = {
  postType: null,
};

export default injectIntl(EndorsedAlertBanner);
