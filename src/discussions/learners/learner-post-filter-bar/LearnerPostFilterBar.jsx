import React, { useEffect } from 'react';

import { isEmpty } from 'lodash';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';

import { sendTrackEvent } from '@edx/frontend-platform/analytics';

import FilterBar from '../../../components/FilterBar';
import { PostsStatusFilter, ThreadType } from '../../../data/constants';
import selectCourseCohorts from '../../cohorts/data/selectors';
import fetchCourseCohorts from '../../cohorts/data/thunks';
import { selectUserHasModerationPrivileges, selectUserIsGroupTa } from '../../data/selectors';
import { setPostFilter } from '../data/slices';

const LearnerPostFilterBar = () => {
  const dispatch = useDispatch();
  const { courseId } = useParams();
  const userHasModerationPrivileges = useSelector(selectUserHasModerationPrivileges);
  const userIsGroupTa = useSelector(selectUserIsGroupTa);
  const cohorts = useSelector(selectCourseCohorts);
  const postFilter = useSelector(state => state.learners.postFilter);

  const filtersToShow = [
    {
      name: 'postType',
      filters: ['type-all', 'type-discussions', 'type-questions'],
    },
    {
      name: 'status',
      filters: ['status-any', 'status-unread', 'status-unanswered', 'status-unresponded'],
    },
    {
      name: 'orderBy',
      filters: ['sort-activity', 'sort-comments', 'sort-votes'],
    },
  ];

  if (userHasModerationPrivileges || userIsGroupTa) {
    filtersToShow[1].filters.splice(2, 0, 'status-reported');
  }

  const handleFilterChange = (event) => {
    const { name, value } = event.currentTarget;
    const filterContentEventProperties = {
      statusFilter: postFilter.status,
      threadTypeFilter: postFilter.postType,
      sortFilter: postFilter.orderBy,
      cohortFilter: postFilter.cohort,
      triggeredBy: name,
    };
    if (name === 'postType') {
      if (postFilter.postType !== value) {
        dispatch(setPostFilter({
          ...postFilter,
          postType: value,
        }));
        filterContentEventProperties.threadTypeFilter = value;
      }
    } else if (name === 'status') {
      if (postFilter.status !== value) {
        const postType = (value === PostsStatusFilter.UNANSWERED && ThreadType.QUESTION)
        || (value === PostsStatusFilter.UNRESPONDED && ThreadType.DISCUSSION)
        || postFilter.postType;

        dispatch(setPostFilter({
          ...postFilter,
          postType,
          status: value,
        }));

        filterContentEventProperties.statusFilter = value;
      }
    } else if (name === 'orderBy') {
      if (postFilter.orderBy !== value) {
        dispatch(setPostFilter({
          ...postFilter,
          orderBy: value,
        }));
        filterContentEventProperties.sortFilter = value;
      }
    } else if (name === 'cohort') {
      if (postFilter.cohort !== value) {
        dispatch(setPostFilter({
          ...postFilter,
          cohort: value,
        }));
        filterContentEventProperties.cohortFilter = value;
      }
    }
    sendTrackEvent('edx.forum.filter.content', filterContentEventProperties);
  };

  useEffect(() => {
    if (userHasModerationPrivileges && isEmpty(cohorts)) {
      dispatch(fetchCourseCohorts(courseId));
    }
  }, [courseId, userHasModerationPrivileges]);

  return (
    <FilterBar
      filters={filtersToShow}
      selectedFilters={postFilter}
      onFilterChange={handleFilterChange}
      showCohortsFilter={userHasModerationPrivileges || userIsGroupTa}
    />
  );
};

export default LearnerPostFilterBar;
