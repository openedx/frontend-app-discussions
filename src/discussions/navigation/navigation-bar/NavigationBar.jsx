import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { Button, Nav, SearchField } from '@edx/paragon';
import React from 'react';
import { useParams } from 'react-router';
import { useLocation, NavLink } from 'react-router-dom';
import { Routes } from '../../../data/constants';
import messages from './messages';
import { buildDiscussionsUrl } from '../../utils';

function NavigationBar({ intl }) {
  const { embed, view, courseId } = useParams();
  const { pathname } = useLocation();

  const navLinks = [
    {
      url: buildDiscussionsUrl(Routes.POSTS.FILTER, {
        embed,
        view,
        courseId,
        postFilter: 'mine',
      }),
      extraActivePaths: [],
      label: intl.formatMessage(messages.my_posts),
    },
    {
      url: buildDiscussionsUrl(Routes.POSTS.FILTER, {
        embed,
        view,
        courseId,
        postFilter: 'all',
      }),
      extraActivePaths: [],
      label: intl.formatMessage(messages.all_posts),
    },
    {
      url: buildDiscussionsUrl(Routes.TOPICS.PATH, {
        embed,
        view,
        courseId,
      }),
      extraActivePaths: [
        Routes.TOPICS.CATEGORY,
      ],
      label: intl.formatMessage(messages.all_topics),
    },
  ];

  return (
    <Nav navbar className="navigation-bar d-flex flex-row my-2">
      { navLinks.map(link => (
        <Nav.Item key={link.label}>
          <Nav.Link
            as={NavLink}
            activeClassName="text-white bg-primary-500 border-primary-300"
            className="rounded-lg"
            to={link.url}
            isActive={() => [link.url].concat(link.extraActivePaths).map(path => (
              buildDiscussionsUrl(
                path,
                {
                  embed,
                  view,
                  courseId,
                },
                true,
              )
            )).some(path => pathname.startsWith(path))}
          >
            { link.label }
          </Nav.Link>
        </Nav.Item>
      ))}
      <div className="d-flex flex-fill justify-content-end">
        <SearchField
          lable=""
          placeholder="Search all posts"
          onSubmit={() => null}
        />
        <Button variant="outline-primary" className="ml-2 rounded-lg">
          Add Post
        </Button>
      </div>
    </Nav>
  );
}

NavigationBar.propTypes = {
  intl: intlShape.isRequired,
};

export default injectIntl(NavigationBar);
