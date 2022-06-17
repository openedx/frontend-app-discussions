import React from 'react';

import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { Icon, OverlayTrigger, Tooltip } from '@edx/paragon';
import { Edit, Report } from '@edx/paragon/icons';

import { QuestionAnswerOutline } from '../../../components/icons';
import messages from '../messages';
import { learnerShape } from './proptypes';

function LearnerFooter({
  learner,
  intl,
}) {
  const { inactiveFlags } = learner;
  const { activeFlags } = learner;
  return (
    <div className="d-flex align-items-center pt-1 mt-2.5" style={{ marginBottom: '2px' }}>
      <div className="d-flex align-items-center">
        <Icon src={QuestionAnswerOutline} className="icon-size mr-2" />
        {learner.threads}
      </div>
      <div className="d-flex align-items-center">
        <Icon src={Edit} className="icon-size mr-2 ml-4" />
        {learner.replies + learner.responses}
      </div>
      {Boolean(activeFlags || inactiveFlags) && (
        <OverlayTrigger
          overlay={(
            <Tooltip id={`learner-${learner.username}`}>
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
          <div className="d-flex align-items-center">
            <Icon src={Report} className="icon-size mr-2 ml-4 text-danger" />
            {activeFlags} {Boolean(inactiveFlags) && `/ ${inactiveFlags}`}
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
