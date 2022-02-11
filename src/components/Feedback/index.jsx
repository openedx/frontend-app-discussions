import React from 'react';

import { ensureConfig, getConfig } from '@edx/frontend-platform';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { Hyperlink } from '@edx/paragon';

import messages from './messages';

ensureConfig(['FEEDBACK_FORM_URL'], 'Feedback');

const Feedback = ({ intl, ...props }) => {
  const formUrl = getConfig().FEEDBACK_FORM_URL;

  return (
    formUrl && (
      <Hyperlink
        className="mr-3 btn btn-primary"
        destination={formUrl}
        target="_blank"
        rel="noopener noreferrer"
        showLaunchIcon={false}
        {...props}
      >
        {intl.formatMessage(messages.feedbackLink)}
      </Hyperlink>
    )
  );
};

Feedback.propTypes = {
  intl: intlShape.isRequired,
};

export default injectIntl(Feedback);
