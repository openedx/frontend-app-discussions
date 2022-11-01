import React from 'react';
import PropTypes from 'prop-types';

import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { ActionRow, Button, ModalDialog } from '@edx/paragon';

import messages from '../messages';

function DeleteConfirmation({
  intl,
  isOpen,
  title,
  description,
  onClose,
  onDelete,
}) {
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
          <ModalDialog.CloseButton variant="tertiary">
            {intl.formatMessage(messages.deleteConfirmationCancel)}
          </ModalDialog.CloseButton>
          <Button variant="primary" onClick={onDelete}>
            {intl.formatMessage(messages.deleteConfirmationDelete)}
          </Button>
        </ActionRow>
      </ModalDialog.Footer>
    </ModalDialog>
  );
}

DeleteConfirmation.propTypes = {
  intl: intlShape.isRequired,
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
};

export default injectIntl(DeleteConfirmation);
