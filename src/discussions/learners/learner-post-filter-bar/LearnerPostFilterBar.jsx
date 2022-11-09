import React, { useEffect } from 'react';

import { isEmpty } from 'lodash';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';

import FilterBar from '../../../components/FilterBar';
import { selectCourseCohorts } from '../../cohorts/data/selectors';
import { fetchCourseCohorts } from '../../cohorts/data/thunks';
import { selectUserHasModerationPrivileges, selectUserIsGroupTa } from '../../data/selectors';
import { setPostFilter } from '../data/slices';

function LearnerPostFilterBar() {
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
    if (name === 'postType') {
      if (postFilter.postType !== value) {
        dispatch(setPostFilter({
          ...postFilter,
          postType: value,
        }));
      }
    } else if (name === 'status') {
      if (postFilter.status !== value) {
        dispatch(setPostFilter({
          ...postFilter,
          status: value,
        }));
      }
    } else if (name === 'orderBy') {
      if (postFilter.orderBy !== value) {
        dispatch(setPostFilter({
          ...postFilter,
          orderBy: value,
        }));
      }
    } else if (name === 'cohort') {
      if (postFilter.cohort !== value) {
        dispatch(setPostFilter({
          ...postFilter,
          cohort: value,
        }));
      }
    }
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
}

export default LearnerPostFilterBar;
