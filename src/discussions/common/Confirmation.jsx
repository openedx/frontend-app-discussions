import React from 'react';
import PropTypes from 'prop-types';

import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { ActionRow, Button, ModalDialog } from '@edx/paragon';

import messages from '../messages';

function Confirmation({
  intl,
  isOpen,
  title,
  description,
  onClose,
  onDelete,
  onReport,
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
          <ModalDialog.CloseButton variant={onDelete ? 'tertiary' : 'default'}>
            {intl.formatMessage(messages.deleteConfirmationCancel)}
          </ModalDialog.CloseButton>
          <Button variant={onDelete ? 'primary' : 'danger'} onClick={onDelete || onReport}>
            {onDelete
              ? intl.formatMessage(messages.deleteConfirmationDelete)
              : intl.formatMessage(messages.reportConfirmationConfirm) }
          </Button>
        </ActionRow>
      </ModalDialog.Footer>
    </ModalDialog>
  );
}

Confirmation.propTypes = {
  intl: intlShape.isRequired,
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onDelete: PropTypes.func,
  onReport: PropTypes.func,
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
};
Confirmation.defaultProps = {
  onDelete: undefined,
  onReport: undefined,
};

export default injectIntl(Confirmation);
