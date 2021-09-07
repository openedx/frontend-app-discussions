import React from 'react';

import { generatePath, useParams } from 'react-router';
import { NavLink } from 'react-router-dom';

import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { Nav } from '@edx/paragon';

import { Routes } from '../../../data/constants';
import messages from './messages';

function NavigationBar({ intl }) {
  const { courseId } = useParams();

  const navLinks = [
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
      labelMessage: messages.allTopics,
    },
  ];
  return (
    <Nav variant="pills" className="py-2">
      {navLinks.map(link => (
        <Nav.Item key={link.route}>
          <Nav.Link as={NavLink} to={generatePath(link.route, { courseId })}>
            {intl.formatMessage(link.labelMessage)}
          </Nav.Link>
        </Nav.Item>
      ))}
    </Nav>
  );
}

NavigationBar.propTypes = {
  intl: intlShape.isRequired,
};

export default injectIntl(NavigationBar);
