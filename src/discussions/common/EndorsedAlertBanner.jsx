import React from 'react';
import PropTypes from 'prop-types';

import * as timeago from 'timeago.js';

import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { Alert, Icon } from '@edx/paragon';
import { CheckCircle, Verified } from '@edx/paragon/icons';

import { ThreadType } from '../../data/constants';
import messages from '../post-comments/messages';
import AuthorLabel from './AuthorLabel';
import timeLocale from './time-locale';

function EndorsedAlertBanner({
  endorsed,
  endorsedAt,
  endorsedBy,
  endorsedByLabel,
  intl,
  postType,
}) {
  timeago.register('time-locale', timeLocale);
  const isQuestion = postType === ThreadType.QUESTION;
  const classes = isQuestion ? 'bg-success-500 text-white' : 'bg-dark-500 text-white';
  const iconClass = isQuestion ? CheckCircle : Verified;

  return (
    endorsed && (
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
            <strong className="ml-2 font-family-inter">
              {intl.formatMessage(isQuestion ? messages.answer : messages.endorsed)}
            </strong>
          </div>
          <span className="d-flex align-items-center align-items-center flex-wrap" style={{ marginRight: '-1px' }}>
            <AuthorLabel
              author={endorsedBy}
              authorLabel={endorsedByLabel}
              linkToProfile
              alert={endorsed}
              postCreatedAt={endorsedAt}
              authorToolTip
              postOrComment
            />
          </span>
        </div>
      </Alert>
    )
  );
}

EndorsedAlertBanner.propTypes = {
  intl: intlShape.isRequired,
  endorsed: PropTypes.string.isRequired,
  endorsedAt: PropTypes.string.isRequired,
  endorsedBy: PropTypes.string.isRequired,
  endorsedByLabel: PropTypes.string.isRequired,
  postType: PropTypes.string,
};

EndorsedAlertBanner.defaultProps = {
  postType: null,
};

export default injectIntl(React.memo(EndorsedAlertBanner));
