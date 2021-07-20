import React from 'react';

import { useParams } from 'react-router';
import { NavLink } from 'react-router-dom';

import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { Nav } from '@edx/paragon';

import { Routes } from '../../../data/constants';
import messages from './messages';

function NavigationBar({ intl }) {
  const { courseId } = useParams();

  const navLinks = [
    {
      url: Routes.POSTS.MY_POSTS.replace(':courseId', courseId),
      label: intl.formatMessage(messages.myPosts),
    },
    {
      url: Routes.POSTS.ALL_POSTS.replace(':courseId', courseId),
      label: intl.formatMessage(messages.allPosts),
    },
    {
      url: Routes.TOPICS.ALL.replace(':courseId', courseId),
      label: intl.formatMessage(messages.allTopics),
    },
  ];

  return (
    <Nav variant="pills" className="py-2">
      {navLinks.map(link => (
        <Nav.Item key={link.label}>
          <Nav.Link as={NavLink} to={link.url}>
            {link.label}
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
