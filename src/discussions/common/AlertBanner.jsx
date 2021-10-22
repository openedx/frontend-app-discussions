import React from 'react';
import PropTypes from 'prop-types';

import * as timeago from 'timeago.js';

import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { Alert, Hyperlink } from '@edx/paragon';
import { CheckCircle, Error, Verified } from '@edx/paragon/icons';

import { ThreadType } from '../../data/constants';
import { commentShape } from '../comments/comment/proptypes';
import messages from '../comments/messages';
import { postShape } from '../posts/post/proptypes';

function AlertBanner({
  intl,
  content,
  postType,
}) {
  const isQuestion = postType === ThreadType.QUESTION;
  const classes = isQuestion ? 'bg-success-500 text-white' : 'bg-dark-500 text-white';
  const iconClass = isQuestion ? CheckCircle : Verified;
  return (
    <>
      {content.endorsed && (
        <Alert variant="plain" className={`p-3 m-0 rounded-0 shadow-none ${classes}`} icon={iconClass}>
          <div className="d-flex justify-content-between">
            <strong>{intl.formatMessage(
              isQuestion
                ? messages.answer
                : messages.endorsed,
            )}
            </strong>
            <span>
              {intl.formatMessage(
                isQuestion
                  ? messages.answeredLabel
                  : messages.endorsedLabel,
              )}&nbsp;
              <Hyperlink>{content.endorsedBy}</Hyperlink>&nbsp;
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
    </>
  );
}
AlertBanner.propTypes = {
  intl: intlShape.isRequired,
  content: PropTypes.oneOfType([commentShape.isRequired, postShape.isRequired]).isRequired,
  postType: PropTypes.string.isRequired,
};

export default injectIntl(AlertBanner);
