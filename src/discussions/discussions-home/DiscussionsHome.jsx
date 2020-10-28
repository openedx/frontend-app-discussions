import React from 'react';
import { Route, Switch } from 'react-router';
import { Routes } from '../../data/constants';
import { BreadcrumbMenu, NavigationBar } from '../navigation';
import { buildDiscussionsUrl } from '../utils';
import PostsViewContainer from '../posts/PostsViewContainer';
import TopicsViewContainer from '../topics/TopicsViewContainer';
import CommentsViewContainer from '../comments/CommentsViewContainer';

export default function DiscussionsHome() {
  const unembeddedCommentsPath = buildDiscussionsUrl(Routes.COMMENTS.PATH, { embed: '' });
  const embeddedPostViewPath = buildDiscussionsUrl(Routes.VIEWS.POST, { embed: 'embed' });
  return (
    <main className="container-fluid my-4">
      <div className="d-flex flex-column">
        <Switch>
          <Route path={Routes.VIEWS.DISCUSSION}>
            <NavigationBar />
            <Switch>
              <Route
                path={[
                  Routes.POSTS.PATH,
                  Routes.TOPICS.CATEGORY,
                  unembeddedCommentsPath,
                ]}
                render={({ match }) => {
                  if (['all', 'mine'].includes(match.params.postId)) {
                    return null;
                  }
                  return <BreadcrumbMenu />;
                }}
              />
            </Switch>
          </Route>
        </Switch>
        <div className="d-flex flex-row">
          <Switch>
            { /* Do not render any of these if the view is the embedded post view */}
            <Route path={embeddedPostViewPath} />
            <Route path="*">
              <div className="d-flex flex-column w-50 pr-1">
                <Switch>
                  <Route
                    path={[
                      Routes.POSTS.PATH,
                      Routes.COMMENTS.PATH,
                      Routes.POSTS.FILTER,
                    ]}
                    component={PostsViewContainer}
                  />
                  <Route
                    path={[
                      Routes.TOPICS.PATH,
                      Routes.TOPICS.CATEGORY,
                    ]}
                    component={TopicsViewContainer}
                  />
                </Switch>
              </div>
            </Route>
          </Switch>
          <Switch>
            <Route
              path={Routes.COMMENTS.PATH}
              render={({ match }) => {
                if (['all', 'mine'].includes(match.params.postId)) {
                  return null;
                }
                return <CommentsViewContainer />;
              }}
            />
          </Switch>
        </div>
      </div>
    </main>
  );
}
