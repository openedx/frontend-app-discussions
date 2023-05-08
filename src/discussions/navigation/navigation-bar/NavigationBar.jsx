import React, { useContext, useMemo } from 'react';

import { matchPath } from 'react-router';
import { NavLink } from 'react-router-dom';

import { useIntl } from '@edx/frontend-platform/i18n';
import { Nav } from '@edx/paragon';

import { Routes } from '../../../data/constants';
import { DiscussionContext } from '../../common/context';
import { useShowLearnersTab } from '../../data/hooks';
import { discussionsPath } from '../../utils';
import messages from './messages';

const NavigationBar = () => {
  const intl = useIntl();
  const { courseId } = useContext(DiscussionContext);
  const showLearnersTab = useShowLearnersTab();

  const navLinks = useMemo(() => ([
    {
      route: Routes.POSTS.MY_POSTS,
      labelMessage: messages.myPosts,
    },
    {
      route: Routes.POSTS.ALL_POSTS,
      labelMessage: messages.allPosts,
    },
    {
      route: Routes.TOPICS.ALL,
      isActive: (match, location) => Boolean(matchPath(location.pathname, { path: Routes.TOPICS.PATH })),
      labelMessage: messages.allTopics,
    },
  ]), []);

  useMemo(() => {
    if (showLearnersTab) {
      navLinks.push({
        route: Routes.LEARNERS.PATH,
        labelMessage: messages.learners,
      });
    }
  }, [showLearnersTab]);

  return (
    <Nav variant="pills" className="py-2 nav-button-group">
      {navLinks.map(link => (
        <Nav.Item key={link.route}>
          <Nav.Link
            key={link.route}
            as={NavLink}
            to={discussionsPath(link.route, { courseId })}
            isActive={link.isActive}
          >
            {intl.formatMessage(link.labelMessage)}
          </Nav.Link>
        </Nav.Item>
      ))}
    </Nav>
  );
};

export default React.memo(NavigationBar);
