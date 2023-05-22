/* eslint-disable no-unused-vars, react/forbid-prop-types */
import React, { useCallback } from 'react';
import PropTypes from 'prop-types';

import classNames from 'classnames';
import { useSelector } from 'react-redux';
import { useParams } from 'react-router';
import { Link } from 'react-router-dom';

import { useIntl } from '@edx/frontend-platform/i18n';
import { Icon, OverlayTrigger, Tooltip } from '@edx/paragon';
import { HelpOutline, PostOutline, Report } from '@edx/paragon/icons';

import { Routes } from '../../../../data/constants';
import { selectUserHasModerationPrivileges, selectUserIsGroupTa } from '../../../data/selectors';
import { discussionsPath } from '../../../utils';
import { selectTopic } from '../../data/selectors';
import messages from '../../messages';

const Topic = ({ topicId, showDivider, index }) => {
  const intl = useIntl();
  const { courseId } = useParams();
  const topic = useSelector(selectTopic(topicId));
  const {
    id, inactiveFlags, activeFlags, name, threadCounts,
  } = topic;
  const userHasModerationPrivileges = useSelector(selectUserHasModerationPrivileges);
  const userIsGroupTa = useSelector(selectUserIsGroupTa);
  const canSeeReportedStats = (activeFlags || inactiveFlags) && (userHasModerationPrivileges || userIsGroupTa);
  const topicUrl = discussionsPath(Routes.TOPICS.TOPIC, { courseId, topicId });

  const isSelected = useCallback((selectedId) => (
    window.location.pathname.includes(selectedId)
  ), []);

  return (
    <Link
      className={
        classNames('discussion-topic p-0 text-decoration-none text-primary-500', {
          'border-bottom border-light-400': showDivider,
        })
      }
      data-topic-id={id}
      to={topicUrl}
      onClick={() => isSelected(id)}
      aria-current={isSelected(id) ? 'page' : undefined}
      role="option"
      tabIndex={(isSelected(id) || index === 0) ? 0 : -1}
    >
      <div className="d-flex flex-row pt-2.5 pb-2 px-4">
        <div className="d-flex flex-column flex-fill" style={{ minWidth: 0 }}>
          <div className="d-flex flex-column justify-content-start mw-100 flex-fill">
            <div className="topic-name text-truncate">
              {name || intl.formatMessage(messages.unnamedTopicSubCategories)}
            </div>
          </div>
          <div className="d-flex align-items-center mt-2.5" style={{ marginBottom: '2px' }}>
            <OverlayTrigger
              placement="right"
              id={`tooltip-${id}-discussions`}
              overlay={(
                <Tooltip id={`tooltip-${id}-discussions`}>
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
              placement="right"
              id={`tooltip-${id}-questions`}
              overlay={(
                <Tooltip id={`tooltip-${id}-questions`}>
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
                id={`tooltip-${id}-flags`}
                placement="right"
                overlay={(
                  <Tooltip id={`tooltip-${id}-flags`}>
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
        </div>
      </div>
      {!showDivider && <div className="divider pt-1 bg-light-500 border-top border-light-700" />}
    </Link>
  );
};

export const topicShape = PropTypes.shape({
  name: PropTypes.string,
  id: PropTypes.string,
  questions: PropTypes.number,
  discussions: PropTypes.number,
  flags: PropTypes.number,
});

Topic.propTypes = {
  topicId: PropTypes.string.isRequired,
  showDivider: PropTypes.bool,
  index: PropTypes.number,
};

Topic.defaultProps = {
  showDivider: true,
  index: -1,
};

export default React.memo(Topic);
