import React from 'react';

import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import {
  Icon, OverlayTrigger, Tooltip,
} from '@edx/paragon';
import {
  Edit, Error,
  QuestionAnswer,
} from '@edx/paragon/icons';

import messages from './messages';
import { learnerShape } from './proptypes';

function LearnerFooter({
  learner,
  intl,
}) {
  const { inactiveFlags } = learner;
  const { activeFlags } = learner;
  return (
    <div className="d-flex align-items-center">
      <Icon src={QuestionAnswer} className="mx-2 my-0" />
      <span style={{ minWidth: '2rem' }}>
        {learner.threads}
      </span>
      <Icon src={Edit} className="mx-2 my-0" />
      <span style={{ minWidth: '2rem' }}>
        {learner.replies + learner.responses}
      </span>
      {Boolean(activeFlags || inactiveFlags)
        && (
          <OverlayTrigger
            overlay={(
              <Tooltip>
                <div className="d-flex flex-column align-items-start">
                  <span>
                    {intl.formatMessage(messages.reported, { reported: activeFlags })}
                  </span>
                  {Boolean(inactiveFlags)
                    && (
                      <span>
                        {intl.formatMessage(messages.previouslyReported, { previouslyReported: inactiveFlags })}
                      </span>
                    )}
                </div>
              </Tooltip>
            )}
          >
            <div className="d-flex">
              <Icon src={Error} className="mx-2 my-0 text-danger" />
              <span style={{ minWidth: '2rem' }}>
                {activeFlags} {Boolean(inactiveFlags) && `/ ${inactiveFlags}`}
              </span>
            </div>
          </OverlayTrigger>
        )}
    </div>
  );
}

LearnerFooter.propTypes = {
  intl: intlShape.isRequired,
  learner: learnerShape.isRequired,
};

export default injectIntl(LearnerFooter);
