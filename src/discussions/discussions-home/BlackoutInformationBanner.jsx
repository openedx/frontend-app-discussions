import React, { useState } from 'react';

import { useSelector } from 'react-redux';

import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { PageBanner } from '@edx/paragon';

import { selectBlackoutDate } from '../data/selectors';
import messages from '../messages';
import { inBlackoutDateRange } from '../utils';

function BlackoutInformationBanner({
  intl,
}) {
  const isDiscussionsBlackout = inBlackoutDateRange(useSelector(selectBlackoutDate));
  const [showBanner, setShowBanner] = useState(true);

  return (
    <PageBanner
      variant="accentB"
      show={isDiscussionsBlackout && showBanner}
      dismissible
      onDismiss={() => setShowBanner(false)}
    >
      <div className="font-weight-500">
        {intl.formatMessage(messages.blackoutDiscussionInformation)}
      </div>
    </PageBanner>
  );
}

BlackoutInformationBanner.propTypes = {
  intl: intlShape.isRequired,
};

export default injectIntl(BlackoutInformationBanner);
