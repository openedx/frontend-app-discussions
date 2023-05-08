import React from 'react';
import PropTypes from 'prop-types';

import { useIntl } from '@edx/frontend-platform/i18n';
import { ActionRow, Button, ModalDialog } from '@edx/paragon';

import messages from '../messages';

function Confirmation({
  isOpen,
  title,
  description,
  onClose,
  comfirmAction,
  closeButtonVaraint,
  confirmButtonVariant,
  confirmButtonText,
}) {
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
          <ModalDialog.CloseButton variant={closeButtonVaraint}>
            {intl.formatMessage(messages.confirmationCancel)}
          </ModalDialog.CloseButton>
          <Button variant={confirmButtonVariant} onClick={comfirmAction}>
            { confirmButtonText || intl.formatMessage(messages.confirmationConfirm)}
          </Button>
        </ActionRow>
      </ModalDialog.Footer>
    </ModalDialog>
  );
}

Confirmation.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  comfirmAction: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  closeButtonVaraint: PropTypes.string,
  confirmButtonVariant: PropTypes.string,
  confirmButtonText: PropTypes.string,
};

Confirmation.defaultProps = {
  closeButtonVaraint: 'default',
  confirmButtonVariant: 'primary',
  confirmButtonText: '',
};

export default React.memo(Confirmation);
