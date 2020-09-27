import React from 'react';
import { useSelector } from 'react-redux';
import DiscussionsHome from './DiscussionsHome';

export default function DiscussionsHomeContainer() {
  const addingPost = useSelector(state => state.posts.postAddingInProgress);

  return (
    <DiscussionsHome addingPost={addingPost} />
  );
}
