import React, { useCallback, useEffect, useMemo } from 'react';

import { Button, Spinner } from '@openedx/paragon';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';

import { useIntl } from '@edx/frontend-platform/i18n';

import SearchInfo from '../../components/SearchInfo';
import { RequestStatus } from '../../data/constants';
import { selectConfigLoadingStatus } from '../data/selectors';
import NoResults from '../posts/NoResults';
import {
  learnersLoadingStatus,
  selectAllLearners,
  selectLearnerNextPage,
  selectLearnerSorting,
  selectUsernameSearch,
} from './data/selectors';
import { setUsernameSearch } from './data/slices';
import { fetchLearners } from './data/thunks';
import { LearnerCard, LearnerFilterBar } from './learner';
import messages from './messages';

const LearnersView = () => {
  const intl = useIntl();
  const { courseId } = useParams();
  const dispatch = useDispatch();
  const orderBy = useSelector(selectLearnerSorting());
  const nextPage = useSelector(selectLearnerNextPage());
  const loadingStatus = useSelector(learnersLoadingStatus());
  const usernameSearch = useSelector(selectUsernameSearch());
  const courseConfigLoadingStatus = useSelector(selectConfigLoadingStatus);
  const learners = useSelector(selectAllLearners);

  useEffect(() => {
    if (usernameSearch) {
      dispatch(fetchLearners(courseId, { orderBy, usernameSearch }));
    } else {
      dispatch(fetchLearners(courseId, { orderBy }));
    }
  }, [courseId, orderBy, usernameSearch]);

  const loadPage = useCallback(async () => {
    if (nextPage) {
      dispatch(fetchLearners(courseId, {
        orderBy,
        page: nextPage,
        usernameSearch,
      }));
    }
  }, [courseId, orderBy, nextPage, usernameSearch]);

  const handleOnClear = useCallback(() => {
    dispatch(setUsernameSearch(''));
  }, []);

  const renderLearnersList = useMemo(() => {
    if (courseConfigLoadingStatus === RequestStatus.SUCCESSFUL) {
      return learners.map((learner) => (
        <LearnerCard learner={learner} key={learner.username} />
      ));
    }
    return null;
  }, [courseConfigLoadingStatus, learners]);

  return (
    <div className="d-flex flex-column border-right border-light-400">
      {!usernameSearch && <LearnerFilterBar /> }
      <div className="border-bottom border-light-400" />
      {usernameSearch && (
        <SearchInfo
          text={usernameSearch}
          count={learners.length}
          loadingStatus={loadingStatus}
          onClear={handleOnClear}
        />
      )}
      <div className="list-group list-group-flush learner" role="list">
        {renderLearnersList}
        {loadingStatus === RequestStatus.IN_PROGRESS ? (
          <div className="d-flex justify-content-center p-4">
            <Spinner animation="border" variant="primary" size="lg" />
          </div>
        ) : (
          nextPage && loadingStatus === RequestStatus.SUCCESSFUL && (
            <Button onClick={() => loadPage()} variant="primary" size="md" data-testid="load-more-learners">
              {intl.formatMessage(messages.loadMore)}
            </Button>
          )
        )}
        { usernameSearch !== '' && learners.length === 0 && loadingStatus === RequestStatus.SUCCESSFUL && <NoResults />}
      </div>
    </div>
  );
};

export default LearnersView;
