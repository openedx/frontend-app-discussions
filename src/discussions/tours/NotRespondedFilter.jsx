import { useEffect } from 'react';

import { useDispatch, useSelector } from 'react-redux';

import { ProductTour } from '@edx/paragon';

import { fetchDiscussionTours, updateTourShowStatus } from './data/thunks';
import { notRespondedFilterTour } from './data/selectors';

export default () => {
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(fetchDiscussionTours());
  }, []);
  const tourData = useSelector(notRespondedFilterTour);
  const config = {
    tourId: 'notRespondedTour',
    advanceButtonText: 'Next',
    dismissButtonText: 'Dismiss',
    endButtonText: 'Okay',
    enabled: tourData ? tourData.showTour : false,
    onDismiss: () => dispatch(updateTourShowStatus(tourData.id)),
    onEnd: () => dispatch(updateTourShowStatus(tourData.id)),
    checkpoints: [
      {
        body: 'Now you can filter discussions .',
        placement: 'right',
        target: '#icon-tune',
        title: 'New filtering option!',
      },

    ],
  };

  return (
    <>
      <ProductTour
        tours={[config]}
      />
    </>
  );
};
