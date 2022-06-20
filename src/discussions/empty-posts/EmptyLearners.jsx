import React from 'react';

import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';

import { useIsOnDesktop } from '../data/hooks';
import messages from '../messages';
import EmptyPage from './EmptyPage';

function EmptyLearners({ intl }) {
  const isOnDesktop = useIsOnDesktop();

  if (!isOnDesktop) {
    return null;
  }

  return (
    <EmptyPage title={intl.formatMessage(messages.emptyTitle)} />
  );
}

EmptyLearners.propTypes = {
  intl: intlShape.isRequired,
};

export default injectIntl(EmptyLearners);
