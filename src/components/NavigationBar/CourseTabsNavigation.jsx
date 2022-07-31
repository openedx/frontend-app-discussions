import React, { useEffect } from 'react';
import PropTypes from 'prop-types';

import classNames from 'classnames';
import { useDispatch, useSelector } from 'react-redux';

import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';

import { fetchTab } from './data/thunks';
import Tabs from './tabs/Tabs';
import messages from './messages';

import './navBar.scss';

function CourseTabsNavigation({
  activeTab, className, intl, courseId, rootSlug,
}) {
  const dispatch = useDispatch();

  const tabs = useSelector(state => state.courseTabs.tabs);
  useEffect(() => {
    dispatch(fetchTab(courseId, rootSlug));
  }, [courseId]);

  return (
    <div id="courseTabsNavigation" className={classNames('course-tabs-navigation', className)}>
      <div className="container-xl">
        {!!tabs.length
          && (
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
    </div>
  );
}

CourseTabsNavigation.propTypes = {
  activeTab: PropTypes.string,
  className: PropTypes.string,
  rootSlug: PropTypes.string,
  courseId: PropTypes.string.isRequired,
  intl: intlShape.isRequired,
};

CourseTabsNavigation.defaultProps = {
  activeTab: undefined,
  className: null,
  rootSlug: 'outline',
};

export default injectIntl(CourseTabsNavigation);
