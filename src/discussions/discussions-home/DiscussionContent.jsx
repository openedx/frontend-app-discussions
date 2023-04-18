import React from 'react';

import { useSelector } from 'react-redux';
import { Route, Switch } from 'react-router';

import { Routes } from '../../data/constants';
import { PostCommentsView } from '../post-comments';
import { PostEditor } from '../posts';

const DiscussionContent = () => {
  const postEditorVisible = useSelector((state) => state.threads.postEditorVisible);
  console.log('DiscussionSidebar');

  return (
    <div className="d-flex bg-light-400 flex-column w-75 w-xs-100 w-xl-75 align-items-center">
      <div className="d-flex flex-column w-100">
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
      </div>
    </div>
  );
};

export default React.memo(DiscussionContent);
