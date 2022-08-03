import React from 'react';
import PropTypes from 'prop-types';

import { useSelector } from 'react-redux';

import { getAuthenticatedUser } from '@edx/frontend-platform/auth';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { Alert } from '@edx/paragon';
import { Error } from '@edx/paragon/icons';

import { commentShape } from '../comments/comment/proptypes';
import messages from '../comments/messages';
import { selectModerationSettings, selectUserIsPrivileged } from '../data/selectors';
import { postShape } from '../posts/post/proptypes';
import AuthorLabel from './AuthorLabel';

function AlertBanner({
  intl,
  content,
}) {
  const userIsPrivileged = useSelector(selectUserIsPrivileged);
  const { reasonCodesEnabled } = useSelector(selectModerationSettings);
  const userIsContentAuthor = getAuthenticatedUser().username === content.author;

  return (
    <>
      {content.abuseFlagged && (
        <Alert icon={Error} variant="danger" className="px-3 mb-2 py-10px shadow-none flex-fill">
          {intl.formatMessage(messages.abuseFlaggedMessage)}
        </Alert>
      )}
      {reasonCodesEnabled && (userIsPrivileged || userIsContentAuthor) && (
        <>
          {content.lastEdit?.reason && (
            <Alert variant="info" className="px-3 shadow-none mb-2 py-10px bg-light-200">
              <div className="d-flex align-items-center">
                {intl.formatMessage(messages.editedBy)}
                <span className="ml-1 mr-3">
                  <AuthorLabel author={content.lastEdit.editorUsername} />
                </span>
                {intl.formatMessage(messages.reason)}:&nbsp;{content.lastEdit.reason}
              </div>
            </Alert>
          )}
          {content.closed && (
            <Alert variant="info" className="px-3 shadow-none mb-2 py-10px bg-light-200">
              <div className="d-flex align-items-center">
                {intl.formatMessage(messages.closedBy)}
                <span className="ml-1 ">
                  <AuthorLabel author={content.closedBy} />
                </span>
                <span className="mx-1" />
                {intl.formatMessage(messages.reason)}:&nbsp;{content.closeReason}
              </div>
            </Alert>
          )}
        </>
      )}
    </>
  );
}

AlertBanner.propTypes = {
  intl: intlShape.isRequired,
  content: PropTypes.oneOfType([commentShape.isRequired, postShape.isRequired]).isRequired,
};

export default injectIntl(AlertBanner);
