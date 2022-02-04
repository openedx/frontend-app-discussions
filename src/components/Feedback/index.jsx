import React from 'react';

import Feedback from 'feeder-react-feedback';

import { ensureConfig, getConfig } from '@edx/frontend-platform';
import { getAuthenticatedUser } from '@edx/frontend-platform/auth';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';

import { FeedbackTypes, primaryColor } from './constants';
import messages from './messages';

import './feeder.scss';

ensureConfig(['FEEDER_PROJECT_ID'], 'Feedback');

const Index = ({ intl, ...props }) => {
  const { email } = getAuthenticatedUser();
  const projectId = getConfig().FEEDER_PROJECT_ID;

  return (
    projectId && (
      <Feedback
        projectId={projectId}
        email
        emailDefaultValue={email}
        feedbackTypes={FeedbackTypes}
        primaryColor={primaryColor}
        submitButtonMsg={intl.formatMessage(messages.submitButton)}
        postSubmitButtonMsg={intl.formatMessage(messages.postSubmitButton)}
        {...props}
      />
    )
  );
};

Index.propTypes = {
  intl: intlShape.isRequired,
};

export default injectIntl(Index);
