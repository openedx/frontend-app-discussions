import React from 'react';
import PropTypes from 'prop-types';

import * as timeago from 'timeago.js';

import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { Alert } from '@edx/paragon';
import { CheckCircle, Verified } from '@edx/paragon/icons';

import { ThreadType } from '../../data/constants';
import { commentShape } from '../comments/comment/proptypes';
import messages from '../comments/messages';
import AuthorLabel from './AuthorLabel';
import timeLocale from './time-locale';

function EndorsedAlertBanner({
  intl,
  content,
  postType,
}) {
  timeago.register('time-locale', timeLocale);
  const isQuestion = postType === ThreadType.QUESTION;
  const classes = isQuestion ? 'bg-success-500 text-white' : 'bg-dark-500 text-white';
  const iconClass = isQuestion ? CheckCircle : Verified;

  return (
    content.endorsed && (
      <Alert
        variant="plain"
        className={`px-3 mb-0 py-10px align-items-center shadow-none ${classes}`}
        style={{ borderRadius: '0.375rem 0.375rem 0 0' }}
        icon={iconClass}
      >
        <div className="d-flex justify-content-between flex-wrap">
          <strong className="lead">{intl.formatMessage(
            isQuestion
              ? messages.answer
              : messages.endorsed,
          )}
          </strong>
          <span className="d-flex align-items-center mr-1 flex-wrap">
            <span className="mr-1">
              {intl.formatMessage(
                isQuestion
                  ? messages.answeredLabel
                  : messages.endorsedLabel,
              )}
            </span>
            <AuthorLabel
              author={content.endorsedBy}
              authorLabel={content.endorsedByLabel}
              linkToProfile
              alert={content.endorsed}
            />
            {intl.formatMessage(messages.time, { time: timeago.format(content.endorsedAt, 'time-locale') })}
          </span>
        </div>
      </Alert>
    )
  );
}

EndorsedAlertBanner.propTypes = {
  intl: intlShape.isRequired,
  content: PropTypes.oneOfType([commentShape.isRequired]).isRequired,
  postType: PropTypes.string,
};

EndorsedAlertBanner.defaultProps = {
  postType: null,
};

export default injectIntl(EndorsedAlertBanner);
