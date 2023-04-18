import React from 'react';

import { useIntl } from '@edx/frontend-platform/i18n';

import { useIsOnDesktop } from '../data/hooks';
import messages from '../messages';
import EmptyPage from './EmptyPage';

const EmptyLearners = () => {
  const intl = useIntl();
  const isOnDesktop = useIsOnDesktop();

  if (!isOnDesktop) {
    return null;
  }

  return (
    <EmptyPage title={intl.formatMessage(messages.emptyTitle)} />
  );
};

export default React.memo(EmptyLearners);
