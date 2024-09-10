import React from 'react';
import PropTypes from 'prop-types';

import { Alert } from '@openedx/paragon';
import { Report } from '@openedx/paragon/icons';
import { useSelector } from 'react-redux';

import { getAuthenticatedUser } from '@edx/frontend-platform/auth';
import { useIntl } from '@edx/frontend-platform/i18n';

import { AvatarOutlineAndLabelColors } from '../../data/constants';
import {
  selectUserHasModerationPrivileges, selectUserIsGroupTa, selectUserIsStaff,
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
      { canSeeLastEditOrClosedAlert && (
        <>
          {lastEdit?.reason && (
            <AlertBar
              message={intl.formatMessage(messages.editedBy)}
              author={lastEdit.editorUsername}
              authorLabel={editByLabel}
              labelColor={editByLabelColor && `text-${editByLabelColor}`}
              reason={lastEdit.reason}
            />
          )}
          {closed && (
            <AlertBar
              message={intl.formatMessage(messages.closedBy)}
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
  closedByLabel: PropTypes.string,
  closeReason: PropTypes.string,
  editByLabel: PropTypes.string,
  lastEdit: PropTypes.shape({
    editorUsername: PropTypes.string,
    reason: PropTypes.string,
  }),
};

AlertBanner.defaultProps = {
  abuseFlagged: false,
  closed: undefined,
  closedBy: undefined,
  closedByLabel: undefined,
  closeReason: undefined,
  editByLabel: undefined,
  lastEdit: {},
};

export default React.memo(AlertBanner);
