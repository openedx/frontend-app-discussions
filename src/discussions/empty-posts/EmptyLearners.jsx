import React from 'react';

import { useIntl } from '@edx/frontend-platform/i18n';

import { useIsOnTablet } from '../data/hooks';
import messages from '../messages';
import EmptyPage from './EmptyPage';

const EmptyLearners = () => {
  const intl = useIntl();
  const isOnTabletorDesktop = useIsOnTablet();

  if (!isOnTabletorDesktop) {
    return null;
  }

  return (
    <EmptyPage title={intl.formatMessage(messages.emptyTitle)} />
  );
};

export default EmptyLearners;
