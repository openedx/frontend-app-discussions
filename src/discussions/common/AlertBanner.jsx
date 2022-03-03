import React from 'react';
import PropTypes from 'prop-types';

import * as timeago from 'timeago.js';

import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { Alert, Icon } from '@edx/paragon';
import {
  CheckCircle, Error, Institution, School, Verified,
} from '@edx/paragon/icons';

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
  const endorsedByLabels = { Staff: 'Staff', 'Community TA': 'TA' };
  return (
    <>
      {content.endorsed && (
        <Alert
          variant="plain"
          className={`p-3 m-0 shadow-none ${classes}`}
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
            <span className="d-flex align-items-center">
              {intl.formatMessage(
                isQuestion
                  ? messages.answeredLabel
                  : messages.endorsedLabel,
              )}
              <span className="mx-2">{content.endorsedBy}</span>

              {content.endorsedByLabel === 'Staff' ? (
                <Icon
                  style={{
                    width: '1rem',
                    height: '1rem',
                  }}
                  src={Institution}
                />
              ) : (
                <Icon
                  style={{
                    width: '1rem',
                    height: '1rem',
                  }}
                  src={School}
                />
              )}

              <span className="mr-3" data-testid="endorsed-by-label">
                {endorsedByLabels[content.endorsedByLabel]}
              </span>
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
