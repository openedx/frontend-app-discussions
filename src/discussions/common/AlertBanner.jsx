import React from 'react';
import PropTypes from 'prop-types';

import { useSelector } from 'react-redux';

import { getAuthenticatedUser } from '@edx/frontend-platform/auth';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { Alert } from '@edx/paragon';
import { Report } from '@edx/paragon/icons';

import { AvatarOutlineAndLabelColors } from '../../data/constants';
import {
  selectModerationSettings, selectUserHasModerationPrivileges, selectUserIsGroupTa, selectUserIsStaff,
} from '../data/selectors';
import { commentShape } from '../post-comments/comments/comment/proptypes';
import messages from '../post-comments/messages';
import { postShape } from '../posts/post/proptypes';
import AlertBar from './AlertBar';

function AlertBanner({
  intl,
  content,
}) {
  const userHasModerationPrivileges = useSelector(selectUserHasModerationPrivileges);
  const userIsGroupTa = useSelector(selectUserIsGroupTa);
  const userIsGlobalStaff = useSelector(selectUserIsStaff);
  const { reasonCodesEnabled } = useSelector(selectModerationSettings);
  const userIsContentAuthor = getAuthenticatedUser().username === content.author;
  const canSeeReportedBanner = content?.abuseFlagged;
  const canSeeLastEditOrClosedAlert = (userHasModerationPrivileges || userIsGroupTa
    || userIsGlobalStaff || userIsContentAuthor
  );
  const editByLabelColor = AvatarOutlineAndLabelColors[content.editByLabel];
  const closedByLabelColor = AvatarOutlineAndLabelColors[content.closedByLabel];

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
            <AlertBar
              message={messages.editedBy}
              author={content.lastEdit.editorUsername}
              authorLabel={content.editByLabel}
              labelColor={editByLabelColor && `text-${editByLabelColor}`}
              reason={content.lastEdit.reason}
            />
          )}
          {content.closed && (
          <AlertBar
            message={messages.closedBy}
            author={content.closedBy}
            authorLabel={content.closedByLabel}
            labelColor={closedByLabelColor && `text-${closedByLabelColor}`}
            reason={content.closeReason}
          />
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
