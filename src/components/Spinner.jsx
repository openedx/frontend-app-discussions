import React from 'react';

import { Spinner as ParagonSpinner } from '@openedx/paragon';

const Spinner = () => (
  <div className="spinner-container" data-testid="spinner">
    <ParagonSpinner animation="border" variant="primary" size="lg" />
  </div>
);

export default React.memo(Spinner);
