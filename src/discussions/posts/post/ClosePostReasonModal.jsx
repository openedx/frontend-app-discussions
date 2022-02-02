import React, { useState } from 'react';
import PropTypes from 'prop-types';

import { useSelector } from 'react-redux';

import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import {
  ActionRow,
  Button,
  Form,
  ModalDialog,
} from '@edx/paragon';

import { selectModerationSettings } from '../../data/selectors';
import messages from './messages';

function ClosePostReasonModal({
  intl,
  isOpen,
  onCancel,
  onConfirm,
}) {
  const [reasonCode, setReasonCode] = useState(null);

  const { postCloseReasons } = useSelector(selectModerationSettings);

  const onChange = event => {
    if (event.target.value) {
      setReasonCode(event.target.value);
    } else {
      setReasonCode(null);
    }
  };

  return (
    <ModalDialog
      title={intl.formatMessage(messages.closePostModalTitle)}
      isOpen={isOpen}
      onClose={onCancel}
      hasCloseButton={false}
    >
      <ModalDialog.Header>
        <ModalDialog.Title>
          {intl.formatMessage(messages.closePostModalTitle)}
        </ModalDialog.Title>
      </ModalDialog.Header>
      <ModalDialog.Body>
        <p>{intl.formatMessage(messages.closePostModalText)}</p>
        <Form.Control
          name="reasonCode"
          as="select"
          value={reasonCode || ''}
          onChange={onChange}
          aria-describedby="closeReasonCodeInput"
          floatingLabel={intl.formatMessage(messages.closePostModalReasonCodeInput)}
        >
          <option key="empty" value="">---</option>
          {postCloseReasons.map(({ code, label }) => (
            <option key={code} value={code}>{label}</option>
          ))}
        </Form.Control>
      </ModalDialog.Body>
      <ModalDialog.Footer>
        <ActionRow>
          <ModalDialog.CloseButton variant="tertiary">
            {intl.formatMessage(messages.closePostModalButtonCancel)}
          </ModalDialog.CloseButton>
          <Button variant="primary" onClick={() => onConfirm(reasonCode)}>
            {intl.formatMessage(messages.closePostModalButtonConfirm)}
          </Button>
        </ActionRow>
      </ModalDialog.Footer>
    </ModalDialog>
  );
}

ClosePostReasonModal.propTypes = {
  intl: intlShape.isRequired,
  isOpen: PropTypes.bool.isRequired,
  onCancel: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
};

export default injectIntl(ClosePostReasonModal);
