import React from 'react';
import PropTypes from 'prop-types';

import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { ActionRow, Button, ModalDialog } from '@edx/paragon';

import { ReportConfirmation } from '../../data/constants';
import messages from '../messages';

function Confirmation({
  intl,
  isOpen,
  title,
  description,
  onClose,
  comfirmAction,
}) {
  const ifDeleteConfirmation = title === ReportConfirmation.Report || false;

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
          <ModalDialog.CloseButton variant={!ifDeleteConfirmation ? 'tertiary' : 'default'}>
            {intl.formatMessage(messages.deleteConfirmationCancel)}
          </ModalDialog.CloseButton>
          <Button variant={!ifDeleteConfirmation ? 'primary' : 'danger'} onClick={comfirmAction}>
            {!ifDeleteConfirmation
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
  comfirmAction: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
};

export default injectIntl(Confirmation);
