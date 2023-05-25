import React from 'react';
import PropTypes from 'prop-types';

import { useSelector } from 'react-redux';

import { getAuthenticatedUser } from '@edx/frontend-platform/auth';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { Alert } from '@edx/paragon';
import { Report } from '@edx/paragon/icons';

import {
  selectModerationSettings, selectUserHasModerationPrivileges, selectUserIsGroupTa, selectUserIsStaff,
} from '../data/selectors';
import { commentShape } from '../post-comments/comments/comment/proptypes';
import messages from '../post-comments/messages';
import { postShape } from '../posts/post/proptypes';
import AuthorLabel from './AuthorLabel';

const AlertBanner = ({
  intl,
  content,
}) => {
  const userHasModerationPrivileges = useSelector(selectUserHasModerationPrivileges);
  const userIsGroupTa = useSelector(selectUserIsGroupTa);
  const userIsGlobalStaff = useSelector(selectUserIsStaff);
  const { reasonCodesEnabled } = useSelector(selectModerationSettings);
  const userIsContentAuthor = getAuthenticatedUser().username === content.author;
  const canSeeReportedBanner = content?.abuseFlagged;
  const canSeeLastEditOrClosedAlert = (userHasModerationPrivileges || userIsGroupTa
    || userIsGlobalStaff || userIsContentAuthor
  );

  return (
    <>
      {canSeeReportedBanner && (
        <Alert icon={Report} variant="danger" className="px-3 mb-1 py-10px shadow-none flex-fill">
          {intl.formatMessage(messages.abuseFlaggedMessage)}
        </Alert>
      )}
      {reasonCodesEnabled && canSeeLastEditOrClosedAlert && (
        <>
          {content.lastEdit?.reason && (
            <Alert variant="info" className="px-3 shadow-none mb-1 py-10px bg-light-200">
              <div className="d-flex align-items-center flex-wrap text-gray-700 font-style">
                {intl.formatMessage(messages.editedBy)}
                <span className="ml-1 mr-3">
                  <AuthorLabel author={content.lastEdit.editorUsername} linkToProfile postOrComment />
                </span>
                <span
                  className="mx-1.5 font-size-8 font-style text-light-700"
                  style={{ lineHeight: '15px' }}
                >
                  {intl.formatMessage(messages.fullStop)}
                </span>
                {intl.formatMessage(messages.reason)}:&nbsp;{content.lastEdit.reason}
              </div>
            </Alert>
          )}
          {content.closed && (
            <Alert variant="info" className="px-3 shadow-none mb-1 py-10px bg-light-200">
              <div className="d-flex align-items-center flex-wrap text-gray-700 font-style">
                {intl.formatMessage(messages.closedBy)}
                <span className="ml-1 ">
                  <AuthorLabel author={content.closedBy} linkToProfile postOrComment />
                </span>
                <span
                  className="mx-1.5 font-size-8 font-style text-light-700"
                  style={{ lineHeight: '15px' }}
                >
                  {intl.formatMessage(messages.fullStop)}
                </span>

                {content.closeReason && (`${intl.formatMessage(messages.reason)}: ${content.closeReason}`)}

              </div>
            </Alert>
          )}
        </>
      )}
    </>
  );
};

AlertBanner.propTypes = {
  intl: intlShape.isRequired,
  content: PropTypes.oneOfType([commentShape.isRequired, postShape.isRequired]).isRequired,
};

export default injectIntl(AlertBanner);
