import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { Button, Nav, SearchField } from '@edx/paragon';
import React from 'react';
import { useDispatch } from 'react-redux';
import { useParams } from 'react-router';
import { NavLink } from 'react-router-dom';
import { Routes } from '../../../data/constants';
import { startPostAdding } from '../../posts/data';
import messages from './messages';

function NavigationBar({ intl }) {
  const dispatch = useDispatch();
  const { courseId } = useParams();

  const navLinks = [
    {
      url: Routes.POSTS.MY_POSTS.replace(':courseId', courseId),
      label: intl.formatMessage(messages.my_posts),
    },
    {
      url: Routes.POSTS.ALL_POSTS.replace(':courseId', courseId),
      label: intl.formatMessage(messages.all_posts),
    },
    {
      url: Routes.TOPICS.ALL.replace(':courseId', courseId),
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
        <Button
          variant="outline-primary"
          className="ml-2 rounded-lg"
          onClick={() => dispatch(startPostAdding())}
        >
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
