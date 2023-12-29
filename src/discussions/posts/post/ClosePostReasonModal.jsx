import React, {
  useCallback, useEffect, useRef, useState,
} from 'react';
import PropTypes from 'prop-types';

import {
  ActionRow,
  Button,
  Form,
  ModalDialog,
} from '@openedx/paragon';
import { useSelector } from 'react-redux';

import { useIntl } from '@edx/frontend-platform/i18n';

import { selectModerationSettings } from '../../data/selectors';
import messages from './messages';

const ClosePostReasonModal = ({
  isOpen,
  onCancel,
  onConfirm,
}) => {
  const intl = useIntl();
  const scrollTo = useRef(null);
  const [reasonCode, setReasonCode] = useState(null);
  const { postCloseReasons } = useSelector(selectModerationSettings);

  const onChange = useCallback(event => {
    if (event.target.value) {
      setReasonCode(event.target.value);
    } else {
      setReasonCode(null);
    }
  }, []);

  useEffect(() => {
    /* istanbul ignore if: This API is not available in the test environment. */
    if (scrollTo.current && scrollTo.current.scrollIntoView) {
      // Use a timeout since the component is first given focus, which scrolls
      // it into view but doesn't centrally align it. This should run after that.
      setTimeout(() => {
        scrollTo.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 0);
    }
  }, [scrollTo, isOpen]);

  return (
    <ModalDialog
      title={intl.formatMessage(messages.closePostModalTitle)}
      isOpen={isOpen}
      onClose={onCancel}
      hasCloseButton={false}
      zIndex={5000}
    >
      <ModalDialog.Header>
        <ModalDialog.Title>
          {intl.formatMessage(messages.closePostModalTitle)}
        </ModalDialog.Title>
      </ModalDialog.Header>
      <ModalDialog.Body>
        <p ref={scrollTo}>{intl.formatMessage(messages.closePostModalText)}</p>
        <Form.Group>
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
        </Form.Group>
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
};

ClosePostReasonModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onCancel: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
};

export default React.memo(ClosePostReasonModal);
