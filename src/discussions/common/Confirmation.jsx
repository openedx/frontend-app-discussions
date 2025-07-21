import React from 'react';
import PropTypes from 'prop-types';

import {
  ActionRow,
  Button,
  ModalDialog,
  Spinner,
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
  confirmButtonVariant,
  confirmButtonText,
  isDataLoading,
}) => {
  const intl = useIntl();

  return (
    <ModalDialog title={title} isOpen={isOpen} hasCloseButton={false} onClose={onClose} zIndex={5000}>
      {isDataLoading ? (
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
          <ModalDialog.Body>
            {description}
            <br />
            {boldDescription && <p className="font-weight-bold pt-2">{boldDescription}</p>}
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
};

Confirmation.defaultProps = {
  closeButtonVariant: 'default',
  confirmButtonVariant: 'primary',
  confirmButtonText: '',
  boldDescription: '',
  isDataLoading: false,
};

export default React.memo(Confirmation);
