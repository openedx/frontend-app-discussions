import React, { lazy, Suspense } from 'react';

import { useSelector } from 'react-redux';
import { Route, Switch } from 'react-router';

import Spinner from '../../components/Spinner';
import { Routes } from '../../data/constants';

const PostEditor = lazy(() => import('../posts/post-editor/PostEditor'));
const PostCommentsView = lazy(() => import('../post-comments/PostCommentsView'));

const DiscussionContent = () => {
  const postEditorVisible = useSelector((state) => state.threads.postEditorVisible);

  return (
    <div className="d-flex bg-light-400 flex-column w-75 w-xs-100 w-xl-75 align-items-center">
      <div className="d-flex flex-column w-100">
        <Suspense fallback={(<Spinner />)}>
          {postEditorVisible ? (
            <Route path={Routes.POSTS.NEW_POST}>
              <PostEditor />
            </Route>
          ) : (
            <Switch>
              <Route path={Routes.POSTS.EDIT_POST}>
                <PostEditor editExisting />
              </Route>
              <Route path={Routes.COMMENTS.PATH}>
                <PostCommentsView />
              </Route>
            </Switch>
          )}
        </Suspense>
      </div>
    </div>
  );
};

export default DiscussionContent;
