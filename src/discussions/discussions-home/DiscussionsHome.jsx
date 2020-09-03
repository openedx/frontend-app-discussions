import React, { Suspense } from 'react';
import { Route, Switch, useParams } from 'react-router';
import { Routes } from '../../data/constants';
import CommentsViewContainer from '../comments/CommentsViewContainer';
import { NavigationBar } from '../navigation-bar';
import PostsViewContainer from '../posts/PostsViewContainer';
import { TopicsViewContainer } from '../topics';
import { getPluginComponent } from '../utils';

export default function DiscussionsHome() {
  const { courseId } = useParams();
  return (
    <main>
      <div className="d-flex flex-row">
        <div className="d-flex flex-column border">
          <NavigationBar courseId={courseId} />
          <Switch>
            <Route path={Routes.POSTS.PATH} component={PostsViewContainer} />
            <Route path={Routes.TOPICS.PATH} component={TopicsViewContainer} />
          </Switch>
        </div>
        <div className="d-flex">
          <Switch>
            <Route path={Routes.COMMENTS.PATH}>
              <CommentsViewContainer />
            </Route>
          </Switch>
        </div>
      </div>
      <Route
        path="/test/:plugin"
        render={({ match }) => {
          const Component = getPluginComponent(match.params.plugin);
          return (
            <div style={{
              border: 'thin solid red',
            }}
            >
              <h1>Plugin: {match.params.plugin}</h1>
              <Suspense fallback={<div>Loading........</div>}>
                <Component settings={{ a: 1, b: 2 }} setSettings={console.log} />
              </Suspense>
            </div>
          );
        }}
      />
    </main>
  );
}
