import React, { useCallback, useState } from 'react';

import { useDispatch, useSelector } from 'react-redux';

import { useIntl } from '@edx/frontend-platform/i18n';

import { selectOnlyVerifiedUsersCanPost } from '../data/selectors';
import { sendAccountActivationEmail } from '../posts/data/thunks';
import postMessages from '../posts/post-actions-bar/messages';
import { Confirmation } from '.';

const withEmailConfirmation = (WrappedComponent) => {
  const EnhancedComponent = (props) => {
    const intl = useIntl();
    const dispatch = useDispatch();
    const [isConfirming, setIsConfirming] = useState(false);
    const onlyVerifiedUsersCanPost = useSelector(selectOnlyVerifiedUsersCanPost);

    const openConfirmation = () => setIsConfirming(true);
    const closeConfirmation = () => setIsConfirming(false);

    const handleConfirmation = useCallback(() => {
      dispatch(sendAccountActivationEmail());
    }, [dispatch]);

    return (
      <>
        <WrappedComponent
          {...props}
          openEmailConfirmation={openConfirmation}
        />
        {!onlyVerifiedUsersCanPost
         && (
         <Confirmation
           isOpen={isConfirming}
           title={intl.formatMessage(postMessages.confirmEmailTitle)}
           description={intl.formatMessage(postMessages.confirmEmailDescription)}
           onClose={closeConfirmation}
           confirmAction={handleConfirmation}
           closeButtonVariant="tertiary"
           confirmButtonText={intl.formatMessage(postMessages.confirmEmailButton)}
           closeButtonText={intl.formatMessage(postMessages.closeButton)}
         />
         )}
      </>
    );
  };

  return EnhancedComponent;
};

export default withEmailConfirmation;
