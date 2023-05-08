/* eslint-disable no-unused-vars, react/forbid-prop-types */
import React from 'react';
import PropTypes from 'prop-types';

import classNames from 'classnames';
import { useSelector } from 'react-redux';
import { useParams } from 'react-router';
import { Link } from 'react-router-dom';

import { useIntl } from '@edx/frontend-platform/i18n';
import { Icon, OverlayTrigger, Tooltip } from '@edx/paragon';
import { HelpOutline, PostOutline, Report } from '@edx/paragon/icons';

import TopicStats from '../../../components/TopicStats';
import { Routes } from '../../../data/constants';
import { selectUserHasModerationPrivileges, selectUserIsGroupTa } from '../../data/selectors';
import { discussionsPath } from '../../utils';
import messages from '../messages';

const Topic = ({
  topic,
  showDivider,
  index,
}) => {
  const intl = useIntl();
  const { courseId } = useParams();
  const userHasModerationPrivileges = useSelector(selectUserHasModerationPrivileges);
  const userIsGroupTa = useSelector(selectUserIsGroupTa);
  const { inactiveFlags, activeFlags } = topic;
  const canSeeReportedStats = (activeFlags || inactiveFlags) && (userHasModerationPrivileges || userIsGroupTa);
  const isSelected = (id) => window.location.pathname.includes(id);
  const topicUrl = discussionsPath(Routes.TOPICS.TOPIC, {
    courseId,
    topicId: topic.id,
  });

  return (
    <>
      <Link
        className={classNames('discussion-topic p-0 text-decoration-none text-primary-500', {
          'border-light-400 border-bottom': showDivider,
        })}
        data-topic-id={topic.id}
        to={topicUrl}
        onClick={() => isSelected(topic.id)}
        aria-current={isSelected(topic.id) ? 'page' : undefined}
        role="option"
        tabIndex={(isSelected(topic.id) || index === 0) ? 0 : -1}
      >
        <div className="d-flex flex-row pt-2.5 pb-2 px-4">
          <div className="d-flex flex-column flex-fill" style={{ minWidth: 0 }}>
            <div className="d-flex flex-column justify-content-start mw-100 flex-fill">
              <div className="topic-name text-truncate">
                {topic?.name || topic?.displayName || intl.formatMessage(messages.unnamedTopicSubCategories)}
              </div>
            </div>
            <TopicStats
              threadCounts={topic?.threadCounts}
              activeFlags={topic?.activeFlags}
              inactiveFlags={topic?.inactiveFlags}
            />
          </div>
        </div>
      </Link>
      {!showDivider && (
        <>
          <div className="divider border-top border-light-500" />
          <div className="divider pt-1 bg-light-300" />
        </>
      )}
    </>
  );
};

export const topicShape = PropTypes.shape({
  id: PropTypes.string,
  usage_key: PropTypes.string,
  name: PropTypes.string,
  thread_counts: PropTypes.shape({
    discussions: PropTypes.number,
    questions: PropTypes.number,
  }),
  enabled_in_context: PropTypes.bool,
  flags: PropTypes.number,
});

Topic.propTypes = {
  topic: topicShape,
  showDivider: PropTypes.bool,
  index: PropTypes.number,
};

Topic.defaultProps = {
  showDivider: true,
  index: -1,
  topic: {
    usage_key: '',
  },
};

export default React.memo(Topic);
