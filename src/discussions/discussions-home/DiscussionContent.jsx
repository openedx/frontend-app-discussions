import React, { useRef } from 'react';

import { useSelector } from 'react-redux';
import { Route, Switch } from 'react-router';

import { Routes } from '../../data/constants';
import { CommentsView } from '../comments';
import { useContainerSizeForParent } from '../data/hooks';
import { LearnersContentView } from '../learners';
import { PostEditor } from '../posts';

export default function DiscussionContent() {
  const refContainer = useRef(null);
  const postEditorVisible = useSelector((state) => state.threads.postEditorVisible);
  useContainerSizeForParent(refContainer);

  return (
    <div className="d-flex bg-light-300 flex-column w-75 w-xs-100 w-xl-75 align-items-center h-100 overflow-auto">
      <div className="d-flex flex-column w-100 mw-xl" ref={refContainer}>
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
            <Route path={Routes.LEARNERS.LEARNER}>
              <LearnersContentView />
            </Route>
          </Switch>
        )}
      </div>
    </div>
  );
}
