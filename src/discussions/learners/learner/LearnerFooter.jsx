import React from 'react';
import PropTypes from 'prop-types';

import { useSelector } from 'react-redux';

import { useIntl } from '@edx/frontend-platform/i18n';
import { Icon, OverlayTrigger, Tooltip } from '@edx/paragon';
import { Edit, Report, ReportGmailerrorred } from '@edx/paragon/icons';

import { QuestionAnswerOutline } from '../../../components/icons';
import { selectUserHasModerationPrivileges, selectUserIsGroupTa } from '../../data/selectors';
import messages from '../messages';

const LearnerFooter = ({
  inactiveFlags, activeFlags, threads, responses, replies, username,
}) => {
  const intl = useIntl();
  const userHasModerationPrivileges = useSelector(selectUserHasModerationPrivileges);
  const userIsGroupTa = useSelector(selectUserIsGroupTa);
  const canSeeLearnerReportedStats = (activeFlags || inactiveFlags) && (userHasModerationPrivileges || userIsGroupTa);

  return (
    <div className="d-flex align-items-center pt-1 mt-2.5" style={{ marginBottom: '2px' }}>
      <OverlayTrigger
        placement="right"
        id={`learner-${username}-responses`}
        overlay={(
          <Tooltip id={`learner-${username}-responses`}>
            <div className="d-flex flex-column align-items-start">
              {intl.formatMessage(messages.allActivity)}
            </div>
          </Tooltip>
        )}
      >
        <div className="d-flex align-items-center">
          <Icon src={QuestionAnswerOutline} className="icon-size mr-2" />
          {threads + responses + replies}
        </div>
      </OverlayTrigger>
      <OverlayTrigger
        placement="right"
        id={`learner-${username}-posts`}
        overlay={(
          <Tooltip id={`learner-${username}-posts`}>
            <div className="d-flex flex-column align-items-start">
              {intl.formatMessage(messages.posts)}
            </div>
          </Tooltip>
        )}
      >
        <div className="d-flex align-items-center">
          <Icon src={Edit} className="icon-size mr-2 ml-4" />
          {threads}
        </div>
      </OverlayTrigger>
      {Boolean(canSeeLearnerReportedStats) && (
        <OverlayTrigger
          placement="right"
          id={`learner-${username}-flags`}
          overlay={(
            <Tooltip id={`learner-${username}-flags`}>
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
};

LearnerFooter.propTypes = {
  inactiveFlags: PropTypes.number,
  activeFlags: PropTypes.number,
  threads: PropTypes.number,
  responses: PropTypes.number,
  replies: PropTypes.number,
  username: PropTypes.string,
};

LearnerFooter.defaultProps = {
  inactiveFlags: 0,
  activeFlags: 0,
  threads: 0,
  responses: 0,
  replies: 0,
  username: '',
};

export default React.memo(LearnerFooter);
