import React, { useEffect } from 'react';

import isEmpty from 'lodash/isEmpty';
import { useDispatch } from 'react-redux';

import { ProductTour } from '@edx/paragon';

import { useTourConfiguration } from '../data/hooks';
import { fetchDiscussionTours } from './data/thunks';

const DiscussionsProductTour = () => {
  const dispatch = useDispatch();
  const config = useTourConfiguration();

  useEffect(() => {
    dispatch(fetchDiscussionTours());
  }, []);

  return (
    <>
      {!isEmpty(config) && (
        <ProductTour
          tours={config}
        />
      )}
    </>
  );
};

export default React.memo(DiscussionsProductTour);
