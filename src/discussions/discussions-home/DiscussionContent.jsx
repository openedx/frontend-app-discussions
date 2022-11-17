import React from 'react';

import { useSelector } from 'react-redux';
import { Route, Switch } from 'react-router';

import { injectIntl } from '@edx/frontend-platform/i18n';

import { Routes } from '../../data/constants';
import { CommentsView } from '../comments';
import { PostEditor } from '../posts';

function DiscussionContent() {
  const postEditorVisible = useSelector((state) => state.threads.postEditorVisible);

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
              <CommentsView />
            </Route>
          </Switch>
        )}
      </div>
    </div>
  );
}

export default injectIntl(DiscussionContent);
