import React, {
  useCallback, useMemo, useState,
} from 'react';
import PropTypes from 'prop-types';

import { useDispatch, useSelector } from 'react-redux';

import { useIntl } from '@edx/frontend-platform/i18n';

import { RequestStatus } from '../../data/constants';
import { selectConfirmEmailStatus, selectContentCreationRateLimited, selectShouldShowEmailConfirmation } from '../data/selectors';
import { hidePostEditor } from '../posts/data';
import { sendAccountActivationEmail } from '../posts/data/thunks';
import postMessages from '../posts/post-actions-bar/messages';
import { Confirmation } from '.';

const withPostingRestrictions = (WrappedComponent) => {
  const EnhancedComponent = ({ onCloseEditor, ...rest }) => {
    const intl = useIntl();
    const dispatch = useDispatch();
    const [isConfirming, setIsConfirming] = useState(false);
    const shouldShowEmailConfirmation = useSelector(selectShouldShowEmailConfirmation);
    const contentCreationRateLimited = useSelector(selectContentCreationRateLimited);
    const confirmEmailStatus = useSelector(selectConfirmEmailStatus);

    const openConfirmation = useCallback(() => {
      setIsConfirming(true);
    }, []);

    const closeConfirmation = useCallback(() => {
      setIsConfirming(false);
      dispatch(hidePostEditor());
      onCloseEditor?.();
    }, [onCloseEditor]);

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
          {...rest}
          onCloseEditor={onCloseEditor}
          openRestrictionDialogue={openConfirmation}
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
        {contentCreationRateLimited
          && (
          <Confirmation
            isOpen={isConfirming}
            title={intl.formatMessage(postMessages.postLimitTitle)}
            description={intl.formatMessage(postMessages.postLimitDescription)}
            onClose={closeConfirmation}
            closeButtonText={intl.formatMessage(postMessages.closeButton)}
            closeButtonVariant="danger"
          />
          )}
      </>
    );
  };

  EnhancedComponent.propTypes = {
    onCloseEditor: PropTypes.func,
  };

  return EnhancedComponent;
};

export default withPostingRestrictions;
