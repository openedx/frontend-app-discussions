import React, { useCallback, useMemo } from 'react';

import { toString } from 'lodash';
import { useDispatch, useSelector } from 'react-redux';

import { sendTrackEvent } from '@edx/frontend-platform/analytics';

import { PostsStatusFilter, ThreadType } from '../../../data/constants';
import { selectCourseCohorts } from '../../cohorts/data/selectors';
import {
  setCohortFilter, setPostsTypeFilter, setSortedBy, setStatusFilter,
} from '../data';
import { selectThreadFilters, selectThreadSorting } from '../data/selectors';

const withFilterHandleChange = WrappedComponent => (
  function FilterHandleChange(props) {
    const dispatch = useDispatch();
    const currentSorting = useSelector(selectThreadSorting());
    const currentFilters = useSelector(selectThreadFilters());
    const cohorts = useSelector(selectCourseCohorts);

    const selectedCohort = useMemo(() => (
      cohorts?.find(cohort => (
        toString(cohort.id) === currentFilters.cohort
      ))
    ), [cohorts, currentFilters.cohort]);

    const handleSortFilterChange = useCallback((event) => {
      const currentType = currentFilters.postType;
      const currentStatus = currentFilters.status;
      const {
        name,
        value,
      } = event.currentTarget;
      const filterContentEventProperties = {
        statusFilter: currentStatus,
        threadTypeFilter: currentType,
        sortFilter: currentSorting,
        cohortFilter: selectedCohort,
        triggeredBy: name,
      };

      if (name === 'type') {
        dispatch(setPostsTypeFilter(value));
        if (
          value === ThreadType.DISCUSSION && currentStatus === PostsStatusFilter.UNANSWERED
        ) {
        // You can't filter discussions by unanswered
          dispatch(setStatusFilter(PostsStatusFilter.ALL));
        }
        filterContentEventProperties.threadTypeFilter = value;
      }

      if (name === 'status') {
        dispatch(setStatusFilter(value));
        if (value === PostsStatusFilter.UNANSWERED && currentType !== ThreadType.QUESTION) {
        // You can't filter discussions by unanswered so switch type to questions
          dispatch(setPostsTypeFilter(ThreadType.QUESTION));
        }
        if (value === PostsStatusFilter.UNRESPONDED && currentType !== ThreadType.DISCUSSION) {
        // You can't filter questions by not responded so switch type to discussion
          dispatch(setPostsTypeFilter(ThreadType.DISCUSSION));
        }
        filterContentEventProperties.statusFilter = value;
      }

      if (name === 'sort') {
        dispatch(setSortedBy(value));
        filterContentEventProperties.sortFilter = value;
      }

      if (name === 'cohort') {
        dispatch(setCohortFilter(value));
        filterContentEventProperties.cohortFilter = value;
      }

      sendTrackEvent('edx.forum.filter.content', filterContentEventProperties);
    }, [currentFilters, currentSorting, selectedCohort]);

    return <WrappedComponent {...props} handleSortFilterChange={handleSortFilterChange} />;
  }
);

export default withFilterHandleChange;
