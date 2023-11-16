import React, { memo, useEffect } from 'react';
import PropTypes from 'prop-types';

import classNames from 'classnames';
import { useDispatch, useSelector } from 'react-redux';

import { useIntl } from '@edx/frontend-platform/i18n';

import withConditionalInContextRendering from '../../discussions/common/withConditionalInContextRendering';
import { useCourseId } from '../../discussions/data/hooks';
import { fetchTab } from './data/thunks';
import Tabs from './tabs/Tabs';
import messages from './messages';

import './navBar.scss';

const CourseTabsNavigation = ({ activeTab, className, rootSlug }) => {
  const dispatch = useDispatch();
  const intl = useIntl();
  const courseId = useCourseId();
  const tabs = useSelector(state => state.courseTabs.tabs);

  useEffect(() => {
    if (courseId) {
      dispatch(fetchTab(courseId, rootSlug));
    }
  }, [courseId]);

  console.log('CourseTabsNavigation');

  return (
    <div id="courseTabsNavigation" tabIndex="-1" className={classNames('course-tabs-navigation px-4', className)}>
      {!!tabs.length && (
        <Tabs
          className="nav-underline-tabs"
          aria-label={intl.formatMessage(messages.courseMaterial)}
        >
          {tabs.map(({ url, title, slug }) => (
            <a
              key={slug}
              className={classNames('nav-item flex-shrink-0 nav-link', { active: slug === activeTab })}
              href={url}
            >
              {title}
            </a>
          ))}
        </Tabs>
      )}
    </div>
  );
};

CourseTabsNavigation.propTypes = {
  activeTab: PropTypes.string,
  className: PropTypes.string,
  rootSlug: PropTypes.string,
};

CourseTabsNavigation.defaultProps = {
  activeTab: 'discussion',
  className: null,
  rootSlug: 'outline',
};

export default memo(withConditionalInContextRendering(CourseTabsNavigation, false));
