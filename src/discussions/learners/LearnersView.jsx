import React, { useEffect } from 'react';

import { useDispatch, useSelector } from 'react-redux';
import {
  Redirect, useLocation, useParams,
} from 'react-router';

import { Spinner } from '@edx/paragon';

import ScrollThreshold from '../../components/ScrollThreshold';
import { RequestStatus, Routes } from '../../data/constants';
import { selectconfigLoadingStatus, selectLearnersTabEnabled } from '../data/selectors';
import {
  learnersLoadingStatus,
  selectAllLearners,
  selectLearnerNextPage,
  selectLearnerSorting,
} from './data/selectors';
import { fetchLearners } from './data/thunks';
import { LearnerCard } from './learner';

function LearnersView() {
  const {
    courseId,
  } = useParams();
  const location = useLocation();
  const dispatch = useDispatch();
  const orderBy = useSelector(selectLearnerSorting());
  const nextPage = useSelector(selectLearnerNextPage());
  const loadingStatus = useSelector(learnersLoadingStatus());
  const courseConfigLoadingStatus = useSelector(selectconfigLoadingStatus);
  const learnersTabEnabled = useSelector(selectLearnersTabEnabled);
  const learners = useSelector(selectAllLearners);
  useEffect(() => {
    if (learnersTabEnabled) {
      dispatch(fetchLearners(courseId, { orderBy }));
    }
  }, [courseId, orderBy, learnersTabEnabled]);

  const loadPage = async () => {
    if (nextPage) {
      dispatch(fetchLearners(courseId, {
        orderBy,
        page: nextPage,
      }));
    }
  };
  return (
    <div className="d-flex flex-column border-right border-light-300 h-100">
      <div className="list-group list-group-flush ">
        {courseConfigLoadingStatus === RequestStatus.SUCCESSFUL && !learnersTabEnabled && (
        <Redirect
          to={{
            ...location,
            pathname: Routes.DISCUSSIONS.PATH,
          }}
        />
        )}
        {courseConfigLoadingStatus === RequestStatus.SUCCESSFUL && learnersTabEnabled && learners.map((learner) => (
          <LearnerCard learner={learner} key={learner.username} courseId={courseId} />
        ))}
        {loadingStatus === RequestStatus.IN_PROGRESS ? (
          <div className="d-flex justify-content-center p-4">
            <Spinner animation="border" variant="primary" size="lg" />
          </div>
        ) : (
          nextPage && (
            <ScrollThreshold onScroll={loadPage} />
          )
        )}
      </div>
    </div>
  );
}

export default LearnersView;
