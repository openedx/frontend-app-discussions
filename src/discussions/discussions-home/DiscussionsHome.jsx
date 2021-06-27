import React from 'react';

import { useSelector } from 'react-redux';
import { Route, Switch } from 'react-router';

import { PostActionsBar } from '../../components';
import { Routes } from '../../data/constants';
import { CommentsView } from '../comments';
import { BreadcrumbMenu, NavigationBar } from '../navigation';
import { PostEditor, PostsView } from '../posts';
import { TopicsView } from '../topics';

export default function DiscussionsHome() {
  const postEditorVisible = useSelector(state => state.threads.postEditorVisible);

  return (
    <main className="container my-4 d-flex flex-row">
      <div className="d-flex flex-column w-50 mr-1">
        <Route path={Routes.DISCUSSIONS.PATH} component={NavigationBar} />
        <Route
          path={[
            Routes.POSTS.PATH,
            Routes.TOPICS.CATEGORY,
          ]}
          component={BreadcrumbMenu}
        />
        <div className="card">
          <Switch>
            <Route path={Routes.POSTS.MY_POSTS}>
              <PostsView showOwnPosts />
            </Route>
            <Route path={Routes.POSTS.ALL_POSTS} component={PostsView} />
            <Route path={Routes.POSTS.PATH} component={PostsView} />
            <Route path={Routes.TOPICS.PATH} component={TopicsView} />
          </Switch>
        </div>
      </div>
      <div className="d-flex w-50 pl-1 flex-column">
        <PostActionsBar />
        {
          postEditorVisible ? <PostEditor />
            : (
              <Route path={Routes.COMMENTS.PATH}>
                <CommentsView />
              </Route>
            )
        }
      </div>
    </main>
  );
}
