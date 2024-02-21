import React, { useContext } from 'react';
import PropTypes from 'prop-types';

import { Alert, Icon } from '@openedx/paragon';
import { CheckCircle, Verified } from '@openedx/paragon/icons';
import * as timeago from 'timeago.js';

import { useIntl } from '@edx/frontend-platform/i18n';

import { ThreadType } from '../../data/constants';
import messages from '../post-comments/messages';
import PostCommentsContext from '../post-comments/postCommentsContext';
import AuthorLabel from './AuthorLabel';
import timeLocale from './time-locale';

const EndorsedAlertBanner = ({
  endorsed,
  endorsedAt,
  endorsedBy,
  endorsedByLabel,
}) => {
  timeago.register('time-locale', timeLocale);

  const intl = useIntl();
  const { postType } = useContext(PostCommentsContext);
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
            <strong className="ml-2">
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
};

EndorsedAlertBanner.propTypes = {
  endorsed: PropTypes.bool.isRequired,
  endorsedAt: PropTypes.string,
  endorsedBy: PropTypes.string,
  endorsedByLabel: PropTypes.string,
};

EndorsedAlertBanner.defaultProps = {
  endorsedAt: null,
  endorsedBy: null,
  endorsedByLabel: null,
};

export default React.memo(EndorsedAlertBanner);
