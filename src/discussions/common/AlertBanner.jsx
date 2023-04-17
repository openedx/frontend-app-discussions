import React from 'react';
import PropTypes from 'prop-types';

import { useSelector } from 'react-redux';

import { getAuthenticatedUser } from '@edx/frontend-platform/auth';
import { useIntl } from '@edx/frontend-platform/i18n';
import { Alert } from '@edx/paragon';
import { Report } from '@edx/paragon/icons';

import { AvatarOutlineAndLabelColors } from '../../data/constants';
import {
  selectModerationSettings, selectUserHasModerationPrivileges, selectUserIsGroupTa, selectUserIsStaff,
} from '../data/selectors';
import messages from '../post-comments/messages';
import AlertBar from './AlertBar';

const AlertBanner = ({
  author,
  abuseFlagged,
  lastEdit,
  closed,
  closedBy,
  closeReason,
  editByLabel,
  closedByLabel,
}) => {
  const intl = useIntl();
  const userHasModerationPrivileges = useSelector(selectUserHasModerationPrivileges);
  const userIsGroupTa = useSelector(selectUserIsGroupTa);
  const userIsGlobalStaff = useSelector(selectUserIsStaff);
  const { reasonCodesEnabled } = useSelector(selectModerationSettings);
  const userIsContentAuthor = getAuthenticatedUser().username === author;
  const canSeeReportedBanner = abuseFlagged;
  const canSeeLastEditOrClosedAlert = (userHasModerationPrivileges || userIsGroupTa
    || userIsGlobalStaff || userIsContentAuthor
  );
  const editByLabelColor = AvatarOutlineAndLabelColors[editByLabel];
  const closedByLabelColor = AvatarOutlineAndLabelColors[closedByLabel];

  return (
    <>
      {canSeeReportedBanner && (
        <Alert icon={Report} variant="danger" className="px-3 mb-1 py-10px shadow-none flex-fill">
          {intl.formatMessage(messages.abuseFlaggedMessage)}
        </Alert>
      )}
      {reasonCodesEnabled && canSeeLastEditOrClosedAlert && (
        <>
          {lastEdit?.reason && (
            <AlertBar
              message={messages.editedBy}
              author={lastEdit.editorUsername}
              authorLabel={editByLabel}
              labelColor={editByLabelColor && `text-${editByLabelColor}`}
              reason={lastEdit.reason}
            />
          )}
          {closed && (
            <AlertBar
              message={messages.closedBy}
              author={closedBy}
              authorLabel={closedByLabel}
              labelColor={closedByLabelColor && `text-${closedByLabelColor}`}
              reason={closeReason}
            />
          )}
        </>
      )}
    </>
  );
};

AlertBanner.propTypes = {
  author: PropTypes.string.isRequired,
  abuseFlagged: PropTypes.bool,
  closed: PropTypes.bool,
  closedBy: PropTypes.string,
  closeReason: PropTypes.string,
  lastEdit: PropTypes.shape({
    editorUsername: PropTypes.string,
    reason: PropTypes.string,
  }),
  abuseFlagged: PropTypes.bool,
  closedBy: PropTypes.string,
  closeReason: PropTypes.string,
  editByLabel: PropTypes.string.isRequired,
  closedByLabel: PropTypes.string.isRequired,
};

AlertBanner.defaultProps = {
  abuseFlagged: false,
  closed: undefined,
  closedBy: undefined,
  closeReason: undefined,
  lastEdit: {},
};

export default React.memo(AlertBanner);
