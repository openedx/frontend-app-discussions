import React, { memo } from 'react';

import isEmpty from 'lodash/isEmpty';

import { ProductTour } from '@edx/paragon';

import withConditionalInContextRendering from '../common/withConditionalInContextRendering';
import { useTourConfiguration } from '../data/hooks';

const DiscussionsProductTour = () => {
  const config = useTourConfiguration();
  console.log('DiscussionsProductTour');

  return (
    !isEmpty(config) && (
      <ProductTour
        tours={config}
      />
    )
  );
};

export default memo(withConditionalInContextRendering(DiscussionsProductTour, false));
