import React, { useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';

import { capitalize, isEmpty, toString } from 'lodash';
import { useDispatch, useSelector } from 'react-redux';

import { Form, Spinner } from '@edx/paragon';

import { RequestStatus } from '../../../data/constants';
import { selectCourseCohorts } from '../../cohorts/data/selectors';
import { fetchCourseCohorts } from '../../cohorts/data/thunks';
import { useCourseId } from '../../data/hooks';
import { selectUserHasModerationPrivileges } from '../../data/selectors';
import { selectThreadFilters } from '../data/selectors';
import ActionItem from './ActionItem';
import withFilterHandleChange from './withFilterHandleChange';

const CohortFilters = ({ handleSortFilterChange }) => {
  const dispatch = useDispatch();
  const courseId = useCourseId();
  const userHasModerationPrivileges = useSelector(selectUserHasModerationPrivileges);
  const currentFilters = useSelector(selectThreadFilters());
  const { status } = useSelector(state => state.cohorts);
  const cohorts = useSelector(selectCourseCohorts);

  useEffect(() => {
    if (userHasModerationPrivileges && isEmpty(cohorts)) {
      dispatch(fetchCourseCohorts(courseId));
    }
  }, [userHasModerationPrivileges]);

  const cohortsMenu = useMemo(() => (
    <>
      <ActionItem
        id="all-groups"
        label="All groups"
        value=""
        selected={currentFilters.cohort}
      />
      {cohorts.map(cohort => (
        <ActionItem
          key={cohort.id}
          id={toString(cohort.id)}
          label={capitalize(cohort.name)}
          value={toString(cohort.id)}
          selected={currentFilters.cohort}
        />
      ))}
    </>
  ), [cohorts, currentFilters.cohort]);

  return (
    userHasModerationPrivileges && (
      <>
        <div className="border-bottom my-2" />
        {status === RequestStatus.IN_PROGRESS ? (
          <div className="d-flex justify-content-center p-4">
            <Spinner animation="border" variant="primary" size="lg" />
          </div>
        ) : (
          <div className="d-flex flex-row pt-2">
            <Form.RadioSet
              name="cohort"
              className="d-flex flex-column list-group list-group-flush w-100"
              value={currentFilters.cohort}
              onChange={handleSortFilterChange}
            >
              {cohortsMenu}
            </Form.RadioSet>
          </div>
        )}
      </>
    )
  );
};

CohortFilters.propTypes = {
  handleSortFilterChange: PropTypes.func.isRequired,
};

export default React.memo(withFilterHandleChange(CohortFilters));
