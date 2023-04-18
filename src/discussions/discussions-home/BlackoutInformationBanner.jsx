import React, { useCallback, useMemo, useState } from 'react';

import { useSelector } from 'react-redux';

import { useIntl } from '@edx/frontend-platform/i18n';
import { PageBanner } from '@edx/paragon';

import { selectBlackoutDate } from '../data/selectors';
import messages from '../messages';
import { inBlackoutDateRange } from '../utils';

const BlackoutInformationBanner = () => {
  const intl = useIntl();
  const blackoutDate = useSelector(selectBlackoutDate);
  const [showBanner, setShowBanner] = useState(true);

  const isDiscussionsBlackout = useMemo(() => (
    inBlackoutDateRange(blackoutDate)
  ), [blackoutDate]);

  const handleDismiss = useCallback(() => {
    setShowBanner(false);
  }, []);

  return (
    <PageBanner
      variant="accentB"
      show={isDiscussionsBlackout && showBanner}
      dismissible
      onDismiss={handleDismiss}
    >
      <div className="font-weight-500">
        {intl.formatMessage(messages.blackoutDiscussionInformation)}
      </div>
    </PageBanner>
  );
};

export default React.memo(BlackoutInformationBanner);
