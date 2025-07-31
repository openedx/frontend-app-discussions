import React from 'react';
import PropTypes from 'prop-types';

import {
  ActionRow,
  ModalDialog,
  Spinner, StatefulButton,
} from '@openedx/paragon';

import { useIntl } from '@edx/frontend-platform/i18n';

import messages from '../messages';

const Confirmation = ({
  isOpen,
  title,
  description,
  boldDescription,
  onClose,
  confirmAction,
  closeButtonVariant,
  confirmButtonState,
  confirmButtonVariant,
  confirmButtonText,
  isDataLoading,
  isConfirmButtonPending,
  pendingConfirmButtonText,
  closeButtonText,
}) => {
  const intl = useIntl();

  return (
    <ModalDialog title={title} isOpen={isOpen} hasCloseButton={false} onClose={onClose} zIndex={5000}>
      {isDataLoading && !isConfirmButtonPending ? (
        <ModalDialog.Body>
          <div className="d-flex justify-content-center p-4">
            <Spinner animation="border" variant="primary" size="lg" />
          </div>
        </ModalDialog.Body>
      ) : (
        <>
          <ModalDialog.Header>
            <ModalDialog.Title>
              {title}
            </ModalDialog.Title>
          </ModalDialog.Header>
          <ModalDialog.Body style={{ whiteSpace: 'pre-line' }}>
            {description}
            {boldDescription && <><br /><p className="font-weight-bold pt-2">{boldDescription}</p></>}
          </ModalDialog.Body>
          <ModalDialog.Footer>
            <ActionRow>
              <ModalDialog.CloseButton variant={closeButtonVariant}>
                {closeButtonText || intl.formatMessage(messages.confirmationCancel)}
              </ModalDialog.CloseButton>
              {confirmAction && (
              <StatefulButton
                labels={{
                  default: confirmButtonText || intl.formatMessage(messages.confirmationConfirm),
                  pending: pendingConfirmButtonText || confirmButtonText
                      || intl.formatMessage(messages.confirmationConfirm),
                }}
                state={isConfirmButtonPending ? 'pending' : confirmButtonState}
                variant={confirmButtonVariant}
                onClick={confirmAction}
              />
              )}
            </ActionRow>
          </ModalDialog.Footer>
        </>
      )}
    </ModalDialog>
  );
};

Confirmation.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  confirmAction: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  boldDescription: PropTypes.string,
  closeButtonVariant: PropTypes.string,
  confirmButtonVariant: PropTypes.string,
  confirmButtonText: PropTypes.string,
  isDataLoading: PropTypes.bool,
  isConfirmButtonPending: PropTypes.bool,
  pendingConfirmButtonText: PropTypes.string,
  closeButtonText: PropTypes.string,
  confirmButtonState: PropTypes.string,
};

Confirmation.defaultProps = {
  closeButtonVariant: 'default',
  confirmButtonVariant: 'primary',
  confirmButtonText: '',
  boldDescription: '',
  isDataLoading: false,
  isConfirmButtonPending: false,
  pendingConfirmButtonText: '',
  closeButtonText: '',
  confirmButtonState: 'default',
};

export default React.memo(Confirmation);
