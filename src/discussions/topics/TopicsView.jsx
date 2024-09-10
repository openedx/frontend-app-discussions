import React, {
  useCallback, useContext, useEffect, useMemo,
} from 'react';

import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';

import SearchInfo from '../../components/SearchInfo';
import { RequestStatus } from '../../data/constants';
import DiscussionContext from '../common/context';
import { selectDiscussionProvider } from '../data/selectors';
import NoResults from '../posts/NoResults';
import { handleKeyDown } from '../utils';
import { selectCategories, selectNonCoursewareTopics, selectTopicFilter } from './data/selectors';
import { setFilter, setTopicsCount } from './data/slices';
import fetchCourseTopics from './data/thunks';
import LegacyTopicGroup from './topic-group/LegacyTopicGroup';
import Topic from './topic-group/topic/Topic';
import countFilteredTopics from './utils';

const CourseWideTopics = () => {
  const { category } = useParams();
  const filter = useSelector(selectTopicFilter);
  const nonCoursewareTopics = useSelector(selectNonCoursewareTopics);

  const filteredNonCoursewareTopics = useMemo(() => (
    nonCoursewareTopics.filter(item => (
      filter ? item.name.toLowerCase().includes(filter) : true
    ))), [nonCoursewareTopics, filter]);

  return (nonCoursewareTopics && category === undefined)
    && filteredNonCoursewareTopics.map((topic, index) => (
      <Topic
        topicId={topic.id}
        key={topic.id}
        index={index}
        showDivider={(filteredNonCoursewareTopics.length - 1) !== index}
      />
    ));
};

const LegacyCoursewareTopics = () => {
  const { category } = useParams();
  const categories = useSelector(selectCategories);

  const filteredCategories = useMemo(() => (
    categories.filter(cat => (category ? cat === category : true))
  ), [categories, category]);

  return filteredCategories?.map(
    categoryId => (
      <LegacyTopicGroup
        categoryId={categoryId}
        key={categoryId}
      />
    ),
  );
};

const TopicsView = () => {
  const dispatch = useDispatch();
  const provider = useSelector(selectDiscussionProvider);
  const topicFilter = useSelector(selectTopicFilter);
  const topicsSelector = useSelector(({ topics }) => topics);
  const filteredTopicsCount = useSelector(({ topics }) => topics.results.count);
  const loadingStatus = useSelector(({ topics }) => topics.status);
  const { courseId } = useContext(DiscussionContext);

  const handleOnClear = useCallback(() => {
    dispatch(setFilter(''));
  }, []);

  useEffect(() => {
    // Don't load till the provider information is available
    if (provider) {
      dispatch(fetchCourseTopics(courseId));
    }
  }, [provider]);

  useEffect(() => {
    const count = countFilteredTopics(topicsSelector, provider);
    dispatch(setTopicsCount(count));
  }, [topicFilter]);

  return (
    <div className="discussion-topics d-flex flex-column h-100" data-testid="topics-view">
      {topicFilter && (
        <SearchInfo
          text={topicFilter}
          count={filteredTopicsCount}
          loadingStatus={loadingStatus}
          onClear={handleOnClear}
        />
      )}
      <div className="list-group list-group-flush flex-fill" role="list" onKeyDown={e => handleKeyDown(e)}>
        <CourseWideTopics />
        <LegacyCoursewareTopics />
      </div>
      {
        filteredTopicsCount === 0
        && loadingStatus === RequestStatus.SUCCESSFUL
        && topicFilter !== ''
        && <NoResults />
      }
    </div>
  );
};

export default TopicsView;
