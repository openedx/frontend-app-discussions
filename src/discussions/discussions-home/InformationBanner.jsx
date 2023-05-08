import React, { useCallback, useState } from 'react';

import { useSelector } from 'react-redux';

import { useIntl } from '@edx/frontend-platform/i18n';
import { Hyperlink, PageBanner } from '@edx/paragon';

import { selectUserIsStaff, selectUserRoles } from '../data/selectors';
import messages from '../messages';

const InformationBanner = () => {
  const intl = useIntl();
  const [showBanner, setShowBanner] = useState(true);
  const userRoles = useSelector(selectUserRoles);
  const isAdmin = useSelector(selectUserIsStaff);
  const learnMoreLink = 'https://openedx.atlassian.net/wiki/spaces/COMM/pages/3509551260/Overview+New+discussions+experience';
  const TAFeedbackLink = process.env.TA_FEEDBACK_FORM;
  const staffFeedbackLink = process.env.STAFF_FEEDBACK_FORM;
  const hideLearnMoreButton = ((userRoles.includes('Student') && userRoles.length === 1) || !userRoles.length) && !isAdmin;
  const showStaffLink = isAdmin || userRoles.includes('Moderator') || userRoles.includes('Administrator');

  const handleDismiss = useCallback(() => {
    setShowBanner(false);
  }, []);

  return (
    <PageBanner
      variant="light"
      show={showBanner}
      dismissible
      onDismiss={handleDismiss}
    >
      <div className="font-weight-500">
        {intl.formatMessage(messages.bannerMessage)}
        {!hideLearnMoreButton
          && (
            <Hyperlink
              destination={learnMoreLink}
              target="_blank"
              showLaunchIcon={false}
              className="pl-2.5"
              variant="muted"
              isInline
            >
              {intl.formatMessage(messages.learnMoreBannerLink)}
            </Hyperlink>
          )}
        <Hyperlink
          destination={showStaffLink ? staffFeedbackLink : TAFeedbackLink}
          target="_blank"
          showLaunchIcon={false}
          variant="muted"
          className="pl-2.5"
          isInline
        >
          {intl.formatMessage(messages.shareFeedback)}
        </Hyperlink>
      </div>
    </PageBanner>
  );
};

export default InformationBanner;
