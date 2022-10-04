import React from 'react';

import { useSelector } from 'react-redux';

import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { Icon, OverlayTrigger, Tooltip } from '@edx/paragon';
import { Edit, Report, ReportGmailerrorred } from '@edx/paragon/icons';

import { QuestionAnswerOutline } from '../../../components/icons';
import { selectUserHasModerationPrivileges, selectUserIsGroupTa } from '../../data/selectors';
import messages from '../messages';
import { learnerShape } from './proptypes';

function LearnerFooter({
  learner,
  intl,
}) {
  const userHasModerationPrivileges = useSelector(selectUserHasModerationPrivileges);
  const userIsGroupTa = useSelector(selectUserIsGroupTa);
  const { inactiveFlags } = learner;
  const { activeFlags } = learner;
  const canSeeLearnerReportedStats = (activeFlags || inactiveFlags) && (userHasModerationPrivileges || userIsGroupTa);

  return (
    <div className="d-flex align-items-center pt-1 mt-2.5" style={{ marginBottom: '2px' }}>
      <OverlayTrigger
        placement="right"
        overlay={(
          <Tooltip>
            <div className="d-flex flex-column align-items-start">
              {intl.formatMessage(messages.allActivity)}
            </div>
          </Tooltip>
        )}
      >
        <div className="d-flex align-items-center">
          <Icon src={QuestionAnswerOutline} className="icon-size mr-2" />
          {learner.threads + learner.responses + learner.replies}
        </div>
      </OverlayTrigger>
      <OverlayTrigger
        placement="right"
        overlay={(
          <Tooltip>
            <div className="d-flex flex-column align-items-start">
              {intl.formatMessage(messages.posts)}
            </div>
          </Tooltip>
        )}
      >
        <div className="d-flex align-items-center">
          <Icon src={Edit} className="icon-size mr-2 ml-4" />
          {learner.threads}
        </div>
      </OverlayTrigger>
      {Boolean(canSeeLearnerReportedStats) && (
        <OverlayTrigger
          placement="right"
          overlay={(
            <Tooltip id={`learner-${learner.username}`}>
              <div className="d-flex flex-column align-items-start">
                {Boolean(activeFlags)
                  && (
                  <span>
                    {intl.formatMessage(messages.reported, { reported: activeFlags })}
                  </span>
                  )}
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
            <Icon src={activeFlags ? Report : ReportGmailerrorred} className="icon-size mr-2 ml-4 text-danger" />
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
