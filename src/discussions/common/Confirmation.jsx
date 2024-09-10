import React from 'react';
import PropTypes from 'prop-types';

import { ActionRow, Button, ModalDialog } from '@openedx/paragon';

import { useIntl } from '@edx/frontend-platform/i18n';

import messages from '../messages';

const Confirmation = ({
  isOpen,
  title,
  description,
  onClose,
  confirmAction,
  closeButtonVariant,
  confirmButtonVariant,
  confirmButtonText,
}) => {
  const intl = useIntl();

  return (
    <ModalDialog title={title} isOpen={isOpen} hasCloseButton={false} onClose={onClose} zIndex={5000}>
      <ModalDialog.Header>
        <ModalDialog.Title>
          {title}
        </ModalDialog.Title>
      </ModalDialog.Header>
      <ModalDialog.Body>
        {description}
      </ModalDialog.Body>
      <ModalDialog.Footer>
        <ActionRow>
          <ModalDialog.CloseButton variant={closeButtonVariant}>
            {intl.formatMessage(messages.confirmationCancel)}
          </ModalDialog.CloseButton>
          <Button variant={confirmButtonVariant} onClick={confirmAction}>
            { confirmButtonText || intl.formatMessage(messages.confirmationConfirm)}
          </Button>
        </ActionRow>
      </ModalDialog.Footer>
    </ModalDialog>
  );
};

Confirmation.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  confirmAction: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  closeButtonVariant: PropTypes.string,
  confirmButtonVariant: PropTypes.string,
  confirmButtonText: PropTypes.string,
};

Confirmation.defaultProps = {
  closeButtonVariant: 'default',
  confirmButtonVariant: 'primary',
  confirmButtonText: '',
};

export default React.memo(Confirmation);
