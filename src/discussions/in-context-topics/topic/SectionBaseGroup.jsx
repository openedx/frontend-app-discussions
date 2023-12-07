import React, { useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';

import classNames from 'classnames';
import { Link, useParams } from 'react-router-dom';

import { useIntl } from '@edx/frontend-platform/i18n';

import TopicStats from '../../../components/TopicStats';
import { Routes } from '../../../data/constants';
import { discussionsPath } from '../../utils';
import messages from '../messages';
import { topicShape } from './Topic';

const SectionBaseGroup = ({
  section,
  sectionTitle,
  sectionId,
  showDivider,
}) => {
  const intl = useIntl();
  const { courseId } = useParams();

  const isSelected = useCallback((id) => (
    window.location.pathname.includes(id)
  ), []);

  const sectionUrl = useCallback((id) => discussionsPath(Routes.TOPICS.CATEGORY, {
    courseId,
    category: id,
  }), [courseId]);

  const renderSection = useMemo(() => (
    section?.map((subsection, index) => (
      <Link
        className={classNames('subsection p-0 text-decoration-none text-primary-500', {
          'border-bottom border-light-400': (section.length - 1 !== index),
        })}
        key={subsection.id}
        role="option"
        data-subsection-id={subsection.id}
        data-testid="subsection-group"
        to={sectionUrl(subsection.id)()}
        onClick={() => isSelected(subsection.id)}
        aria-current={isSelected(section.id) ? 'page' : undefined}
        tabIndex={(isSelected(subsection.id) || index === 0) ? 0 : -1}
      >
        <div className="d-flex flex-row pt-2.5 pb-2 px-4">
          <div className="d-flex flex-column flex-fill" style={{ minWidth: 0 }}>
            <div className="d-flex flex-column justify-content-start mw-100 flex-fill">
              <div className="topic-name text-truncate">
                {subsection?.displayName || intl.formatMessage(messages.unnamedSubsection)}
              </div>
              <TopicStats threadCounts={subsection?.threadCounts} />
            </div>
          </div>
        </div>
      </Link>
    ))
  ), [section, sectionUrl, isSelected]);

  return (
    <div
      className="discussion-topic-group d-flex flex-column text-primary-500"
      data-section-id={sectionId}
      data-testid="section-group"
    >
      <div className="pt-3 px-4 font-weight-bold">
        {sectionTitle || intl.formatMessage(messages.unnamedSection)}
      </div>
      {renderSection}
      {showDivider && (
        <>
          <div className="divider border-top border-light-500" />
          <div className="divider pt-1 bg-light-300" />
        </>
      )}
    </div>
  );
};

SectionBaseGroup.propTypes = {
  section: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string,
    blockId: PropTypes.string,
    lmsWebUrl: PropTypes.string,
    legacyWebUrl: PropTypes.string,
    studentViewUrl: PropTypes.string,
    type: PropTypes.string,
    displayName: PropTypes.string,
    children: PropTypes.arrayOf(topicShape),
  })).isRequired,
  sectionTitle: PropTypes.string.isRequired,
  sectionId: PropTypes.string.isRequired,
  showDivider: PropTypes.bool.isRequired,
};

export default React.memo(SectionBaseGroup);
