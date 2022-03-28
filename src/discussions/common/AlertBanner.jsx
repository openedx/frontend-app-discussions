import React from 'react';
import PropTypes from 'prop-types';

import { useSelector } from 'react-redux';
import * as timeago from 'timeago.js';

import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { Alert } from '@edx/paragon';
import { CheckCircle, Error, Verified } from '@edx/paragon/icons';

import { ThreadType } from '../../data/constants';
import { commentShape } from '../comments/comment/proptypes';
import messages from '../comments/messages';
import { selectModerationSettings, selectUserIsPrivileged } from '../data/selectors';
import { postShape } from '../posts/post/proptypes';
import AuthorLabel from './AuthorLabel';

function AlertBanner({
  intl,
  content,
  postType,
}) {
  const isQuestion = postType === ThreadType.QUESTION;
  const classes = isQuestion ? 'bg-success-500 text-white' : 'bg-dark-500 text-white';
  const iconClass = isQuestion ? CheckCircle : Verified;
  const userIsPrivileged = useSelector(selectUserIsPrivileged);
  const { reasonCodesEnabled } = useSelector(selectModerationSettings);
  return (
    <>
      {content.endorsed && (
        <Alert
          variant="plain"
          className={`p-3 m-0 align-items-center shadow-none ${classes}`}
          style={{ borderRadius: '0.375rem 0.375rem 0 0' }}
          icon={iconClass}
        >
          <div className="d-flex justify-content-between">
            <strong className="lead">{intl.formatMessage(
              isQuestion
                ? messages.answer
                : messages.endorsed,
            )}
            </strong>
            <span className="d-flex align-items-center mr-1">
              <span className="mr-2">
                {intl.formatMessage(
                  isQuestion
                    ? messages.answeredLabel
                    : messages.endorsedLabel,
                )}
              </span>
              <AuthorLabel author={content.endorsedBy} authorLabel={content.endorsedByLabel} />
              {timeago.format(content.endorsedAt, intl.locale)}
            </span>
          </div>
        </Alert>
      )}
      {content.abuseFlagged && (
        <Alert icon={Error} variant="danger" className="p-3 m-0 shadow-none mb-1 flex-fill">
          {intl.formatMessage(messages.abuseFlaggedMessage)}
        </Alert>
      )}
      {reasonCodesEnabled && userIsPrivileged && content.lastEdit?.reason && (
        <Alert variant="info" className="p-3 m-0 shadow-none mb-1 bg-light-200">
          <div className="d-flex align-items-center">
            {intl.formatMessage(messages.editedBy)}
            <span className="ml-1 mr-3">
              <AuthorLabel author={content.lastEdit.editorUsername} linkToProfile />
            </span>
            {intl.formatMessage(messages.reason)}:&nbsp;{content.lastEdit.reason}
          </div>
        </Alert>
      )}
    </>
  );
}

AlertBanner.propTypes = {
  intl: intlShape.isRequired,
  content: PropTypes.oneOfType([commentShape.isRequired, postShape.isRequired]).isRequired,
  postType: PropTypes.string,
};

AlertBanner.defaultProps = {
  postType: null,
};

export default injectIntl(AlertBanner);
