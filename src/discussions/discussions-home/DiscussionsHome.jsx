import PropTypes from 'prop-types';
import React from 'react';
import { Route, Switch } from 'react-router';
import { Routes } from '../../data/constants';
import { BreadcrumbMenu, NavigationBar } from '../navigation';
import PostAdd from '../posts/post-add/PostAdd';
import PostsViewContainer from '../posts/PostsViewContainer';
import TopicsViewContainer from '../topics/TopicsViewContainer';
import CommentsViewContainer from '../comments/CommentsViewContainer';

function DiscussionsHome({ addingPost }) {
  return (
    <main className="container-fluid my-4">
      <div className="d-flex flex-column">
        <Switch>
          <Route path={Routes.DISCUSSIONS.PATH} component={NavigationBar} />
        </Switch>
        <Switch>
          <Route
            path={[
              Routes.POSTS.PATH,
              Routes.TOPICS.CATEGORY,
            ]}
            component={BreadcrumbMenu}
          />
        </Switch>
        <div className="d-flex flex-row">
          <div className="d-flex flex-column w-50 pr-1">
            <Switch>
              <Route path={Routes.POSTS.MY_POSTS}>
                <PostsViewContainer mine />
              </Route>
              <Route path={Routes.POSTS.ALL_POSTS} component={PostsViewContainer} />
              <Route path={Routes.POSTS.PATH} component={PostsViewContainer} />
              <Route path={Routes.TOPICS.PATH} component={TopicsViewContainer} />
            </Switch>
          </div>
          <div className="d-flex w-50 pl-1">
            { addingPost
              ? <PostAdd />
              : (
                <Switch>
                  <Route path={Routes.COMMENTS.PATH}>
                    <CommentsViewContainer />
                  </Route>
                </Switch>
              )}
          </div>
        </div>
      </div>
    </main>
  );
}

DiscussionsHome.propTypes = {
  addingPost: PropTypes.bool.isRequired,
};

export default DiscussionsHome;
