import React, { useEffect } from 'react';

import { ProductTour } from '@openedx/paragon';
import isEmpty from 'lodash/isEmpty';
import { useDispatch } from 'react-redux';

import { useTourConfiguration } from '../data/hooks';
import { fetchDiscussionTours } from './data/thunks';

const DiscussionsProductTour = () => {
  const dispatch = useDispatch();
  const config = useTourConfiguration();

  useEffect(() => {
    dispatch(fetchDiscussionTours());
  }, []);

  return (
    !isEmpty(config) && (
      <ProductTour
        tours={config}
      />
    )
  );
};

export default DiscussionsProductTour;
