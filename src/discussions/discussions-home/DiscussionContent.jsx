import React from 'react';

import { useSelector } from 'react-redux';
import { Route, Switch } from 'react-router';

import { Routes } from '../../data/constants';
import { CommentsView } from '../comments';
import { PostEditor } from '../posts';

export default function DiscussionContent() {
  const postEditorVisible = useSelector(
    (state) => state.threads.postEditorVisible,
  );
  return (
    <div className="d-flex bg-light-300 flex-column w-75 w-xs-100 w-xl-75 align-items-center h-100 pb-2 overflow-auto">
      <div className="d-flex flex-column w-100 mw-xl">
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
              <CommentsView />
            </Route>
          </Switch>
        )}
      </div>
    </div>
  );
}
