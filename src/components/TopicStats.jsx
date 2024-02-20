/* eslint react/prop-types: 0 */
import React from 'react';
import PropTypes from 'prop-types';

import { Icon, OverlayTrigger, Tooltip } from '@openedx/paragon';
import { HelpOutline, PostOutline, Report } from '@openedx/paragon/icons';
import { useSelector } from 'react-redux';

import { useIntl } from '@edx/frontend-platform/i18n';

import {
  selectUserHasModerationPrivileges,
  selectUserIsGroupTa,
} from '../discussions/data/selectors';
import messages from '../discussions/in-context-topics/messages';

const TopicStats = ({
  threadCounts,
  activeFlags,
  inactiveFlags,
}) => {
  const intl = useIntl();
  const userHasModerationPrivileges = useSelector(selectUserHasModerationPrivileges);
  const userIsGroupTa = useSelector(selectUserIsGroupTa);
  const canSeeReportedStats = (activeFlags || inactiveFlags) && (userHasModerationPrivileges || userIsGroupTa);

  return (
    <div className="d-flex align-items-center mt-2.5" style={{ marginBottom: '2px' }}>
      <OverlayTrigger
        id="discussion-topic-stats"
        placement="right"
        overlay={(
          <Tooltip id="discussion-topic-stats">
            <div className="d-flex flex-column align-items-start">
              {intl.formatMessage(messages.discussions, {
                count: threadCounts?.discussion || 0,
              })}
            </div>
          </Tooltip>
        )}
      >
        <div className="d-flex align-items-center mr-3.5">
          <Icon src={PostOutline} className="icon-size mr-2" />
          {threadCounts?.discussion || 0}
        </div>
      </OverlayTrigger>
      <OverlayTrigger
        id="question-topic-stats"
        placement="right"
        overlay={(
          <Tooltip id="question-topic-stats">
            <div className="d-flex flex-column align-items-start">
              {intl.formatMessage(messages.questions, {
                count: threadCounts?.question || 0,
              })}
            </div>
          </Tooltip>
        )}
      >
        <div className="d-flex align-items-center mr-3.5">
          <Icon src={HelpOutline} className="icon-size mr-2" />
          {threadCounts?.question || 0}
        </div>
      </OverlayTrigger>
      {Boolean(canSeeReportedStats) && (
        <OverlayTrigger
          id="reported-topic-stats"
          placement="right"
          overlay={(
            <Tooltip id="reported-topic-stats">
              <div className="d-flex flex-column align-items-start">
                {Boolean(activeFlags) && (
                  <span>
                    {intl.formatMessage(messages.reported, { reported: activeFlags })}
                  </span>
                )}
                {Boolean(inactiveFlags) && (
                  <span>
                    {intl.formatMessage(messages.previouslyReported, { previouslyReported: inactiveFlags })}
                  </span>
                )}
              </div>
            </Tooltip>
          )}
        >
          <div className="d-flex align-items-center">
            <Icon src={Report} className="icon-size mr-2 text-danger" />
            {activeFlags}{Boolean(inactiveFlags) && `/${inactiveFlags}`}
          </div>
        </OverlayTrigger>
      )}
    </div>
  );
};

TopicStats.propTypes = {
  threadCounts: PropTypes.shape({
    discussions: PropTypes.number,
    questions: PropTypes.number,
  }),
  activeFlags: PropTypes.number,
  inactiveFlags: PropTypes.number,
};

TopicStats.defaultProps = {
  threadCounts: {
    discussions: 0,
    questions: 0,
  },
  activeFlags: null,
  inactiveFlags: null,
};

export default React.memo(TopicStats);
