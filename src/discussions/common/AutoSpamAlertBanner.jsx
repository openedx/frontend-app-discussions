import React from 'react';
import PropTypes from 'prop-types';

import { ActionRow, Alert, Icon, ModalDialog, useToggle } from '@openedx/paragon';
import { Report, HelpOutline } from '@openedx/paragon/icons';
import { useIntl } from '@edx/frontend-platform/i18n';

import messages from '../messages';

const AutoSpamAlertBanner = ({ autoSpamFlagged }) => {
  const intl = useIntl();
  const [isModalOpen, showModal, hideModal] = useToggle(false);

  if (!autoSpamFlagged) {
    return null;
  }

  return (
    <>
      <Alert icon={Report} variant="danger" className="px-3 mb-1 py-10px shadow-none flex-fill">
        <div className="d-flex align-items-center justify-content-between">
          <span>{intl.formatMessage(messages.autoSpamFlaggedMessage)}</span>
          <Icon
            src={HelpOutline}
            className="ml-2"
            onClick={showModal}
            style={{ cursor: 'pointer' }}
            aria-label={intl.formatMessage(messages.autoSpamModalIconAlt)}
          />
        </div>
      </Alert>

      <ModalDialog
        title={intl.formatMessage(messages.autoSpamModalTitle)}
        isOpen={isModalOpen}
        onClose={hideModal}
      >
        <ModalDialog.Header>
          <ModalDialog.Title>
            {intl.formatMessage(messages.autoSpamModalTitle)}
          </ModalDialog.Title>
        </ModalDialog.Header>
        <ModalDialog.Body>
           <p>
            {intl.formatMessage(messages.autoSpamModalBodyParagraph1)}
          </p>
          <p>
            {intl.formatMessage(messages.autoSpamModalBodyParagraph2)}
          </p>
        </ModalDialog.Body>
        <ModalDialog.Footer>
          <ActionRow>
            <ModalDialog.CloseButton variant="primary">
              {intl.formatMessage(messages.autoSpamModalClose)}
            </ModalDialog.CloseButton>
          </ActionRow>
        </ModalDialog.Footer>
      </ModalDialog>
    </>
  );
};

AutoSpamAlertBanner.propTypes = {
  autoSpamFlagged: PropTypes.bool,
};

AutoSpamAlertBanner.defaultProps = {
  autoSpamFlagged: false,
};

export default React.memo(AutoSpamAlertBanner);
