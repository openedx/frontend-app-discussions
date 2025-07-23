import React, { useCallback, useMemo, useState } from 'react';

import { useDispatch, useSelector } from 'react-redux';

import { useIntl } from '@edx/frontend-platform/i18n';

import { RequestStatus } from '../../data/constants';
import { selectConfirmEmailStatus, selectShouldShowEmailConfirmation } from '../data/selectors';
import { sendAccountActivationEmail } from '../posts/data/thunks';
import postMessages from '../posts/post-actions-bar/messages';
import { Confirmation } from '.';

const withEmailConfirmation = (WrappedComponent) => {
  const EnhancedComponent = (props) => {
    const intl = useIntl();
    const dispatch = useDispatch();
    const [isConfirming, setIsConfirming] = useState(false);
    const shouldShowEmailConfirmation = useSelector(selectShouldShowEmailConfirmation);
    const confirmEmailStatus = useSelector(selectConfirmEmailStatus);

    const openConfirmation = useCallback(() => {
      setIsConfirming(true);
    }, []);

    const closeConfirmation = useCallback(() => {
      setIsConfirming(false);
    }, []);

    const handleConfirmation = useCallback(() => {
      dispatch(sendAccountActivationEmail());
    }, [dispatch]);

    const confirmButtonState = useMemo(() => {
      if (confirmEmailStatus === RequestStatus.IN_PROGRESS) { return 'pending'; }
      if (confirmEmailStatus === RequestStatus.SUCCESSFUL) { return 'complete'; }
      return 'primary';
    }, [confirmEmailStatus]);

    return (
      <>
        <WrappedComponent
          {...props}
          openEmailConfirmation={openConfirmation}
        />
        {shouldShowEmailConfirmation
         && (
         <Confirmation
           isOpen={isConfirming}
           title={intl.formatMessage(postMessages.confirmEmailTitle)}
           description={intl.formatMessage(postMessages.confirmEmailDescription)}
           onClose={closeConfirmation}
           confirmAction={handleConfirmation}
           closeButtonVariant="tertiary"
           confirmButtonState={confirmButtonState}
           confirmButtonText={intl.formatMessage(postMessages.confirmEmailButton)}
           closeButtonText={intl.formatMessage(postMessages.closeButton)}
           confirmButtonVariant="danger"
         />
         )}
      </>
    );
  };

  return EnhancedComponent;
};

export default withEmailConfirmation;
