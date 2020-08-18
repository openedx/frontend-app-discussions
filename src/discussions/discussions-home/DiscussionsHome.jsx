import React from 'react';
import { Route, Switch, useParams } from 'react-router';
import { Routes } from '../../data/constants';
import CommentsViewContainer from '../comments/CommentsViewContainer';
import { NavigationBar } from '../navigation-bar';
import PostsViewContainer from '../posts/PostsViewContainer';
import { TopicsViewContainer } from '../topics';

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
            <Route path={Routes.POSTS.PATH}>
              <CommentsViewContainer />
            </Route>
          </Switch>
        </div>
      </div>
    </main>
  );
}
