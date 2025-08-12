import React, { useState } from 'react';

import {
  Button,
  Image,
  MarketingModal,
  ModalDialog,
  PageBanner,
} from '@openedx/paragon';
import { useDispatch, useSelector } from 'react-redux';

import { useIntl } from '@edx/frontend-platform/i18n';

import confirmEmailSVG from '../../assets/confirm-email.svg';
import { selectIsEmailVerified } from '../data/selectors';
import { sendAccountActivationEmail } from '../posts/data/thunks';
import messages from './messages';

const DiscussionsConfirmEmailBanner = () => {
  const intl = useIntl();
  const dispatch = useDispatch();
  const isEmailVerified = useSelector(selectIsEmailVerified);
  const [showPageBanner, setShowPageBanner] = useState(!isEmailVerified);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const closePageBanner = () => setShowPageBanner(false);
  const closeConfirmModal = () => setShowConfirmModal(false);
  const openConfirmModal = () => setShowConfirmModal(true);

  if (isEmailVerified) { return null; }

  const openConfirmModalButtonClick = () => {
    dispatch(sendAccountActivationEmail());
    openConfirmModal();
    closePageBanner();
  };

  const userConfirmEmailButtonClick = () => {
    closeConfirmModal();
    closePageBanner();
  };

  return (
    <>
      <PageBanner show={showPageBanner} dismissible onDismiss={closePageBanner}>
        {intl.formatMessage(messages.confirmEmailTextReminderBanner, {
          confirmNowButton: (
            <Button
              className="confirm-email-now-button"
              variant="link"
              size="inline"
              onClick={openConfirmModalButtonClick}
            >
              {intl.formatMessage(messages.confirmNowButton)}
            </Button>
          ),
        })}
      </PageBanner>
      <MarketingModal
        title=""
        isOpen={showConfirmModal}
        onClose={closeConfirmModal}
        hasCloseButton={false}
        heroNode={(
          <ModalDialog.Hero className="bg-gray-300">
            <Image
              className="m-auto"
              src={confirmEmailSVG}
              alt={intl.formatMessage(messages.confirmEmailImageAlt)}
            />
          </ModalDialog.Hero>
        )}
        footerNode={(
          <Button className="mx-auto my-3" variant="danger" onClick={userConfirmEmailButtonClick}>
            {intl.formatMessage(messages.verifiedConfirmEmailButton)}
          </Button>
        )}
      >
        <h2 className="text-center p-3 h1">{intl.formatMessage(messages.confirmEmailModalHeader)}</h2>
        <p className="text-center">{intl.formatMessage(messages.confirmEmailModalBody)}</p>
      </MarketingModal>
    </>
  );
};

DiscussionsConfirmEmailBanner.propTypes = {};

export default DiscussionsConfirmEmailBanner;
