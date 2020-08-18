import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router';
import { selectCourseTopics } from './data/selectors';
import { fetchCourseTopics } from './data/thunks';
import TopicsView from './TopicsView';


function TopicsViewContainer() {
  const { courseId } = useParams();
  const dispatch = useDispatch();
  const topics = useSelector(selectCourseTopics);
  useEffect(() => {
    // The courseId from the URL is the course we WANT to load.
    dispatch(fetchCourseTopics(courseId));
  }, [courseId]);

  return (
    <TopicsView coursewareTopics={topics.courseware_topics} nonCoursewareTopics={topics.non_courseware_topics} />
  );
}

TopicsViewContainer.propTypes = {};

export default TopicsViewContainer;
