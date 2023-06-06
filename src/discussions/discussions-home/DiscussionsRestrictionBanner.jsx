import React, { useCallback, useState } from 'react';

import { useSelector } from 'react-redux';

import { useIntl } from '@edx/frontend-platform/i18n';
import { PageBanner } from '@edx/paragon';

import { RequestStatus } from '../../data/constants';
import { selectconfigLoadingStatus, selectIsPostingEnabled } from '../data/selectors';
import messages from '../messages';

const DiscussionsRestrictionBanner = () => {
  const intl = useIntl();
  const isPostingEnabled = useSelector(selectIsPostingEnabled);
  const configLoadingStatus = useSelector(selectconfigLoadingStatus);
  const [showBanner, setShowBanner] = useState(true);

  const handleDismiss = useCallback(() => {
    setShowBanner(false);
  }, []);

  return (
    <PageBanner
      variant="accentB"
      show={!isPostingEnabled && showBanner && configLoadingStatus === RequestStatus.SUCCESSFUL}
      dismissible
      onDismiss={handleDismiss}
    >
      <div className="font-weight-500">
        {intl.formatMessage(messages.blackoutDiscussionInformation)}
      </div>
    </PageBanner>
  );
};

export default DiscussionsRestrictionBanner;
