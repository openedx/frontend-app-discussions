import React from 'react';

import { Alert } from '@edx/paragon';
import {
  Flag,
  MoreVert,
  Pin,
  VerifiedBadge,
} from '@edx/paragon/icons';

const BANNER_TYPE = {
  closed: (message) => <Alert className="d-flex flex-row align-items-start mb-0 p-2 border border-radius-1" variant="gray" icon={MoreVert}><>{message}</></Alert>,
  reported: (message) => <Alert className="d-flex flex-row align-items-start mb-0 p-2 border border-radius-1" variant="danger" icon={Flag}><>{message}</></Alert>,
  endorsed: (message) => <Alert className="d-flex flex-row align-items-start mb-0 p-2 border border-radius-1" variant="success" icon={VerifiedBadge}><>{message}</></Alert>,
  pinned: (message) => <Alert className="d-flex flex-row align-items-start mb-0 p-2 border border-radius-1" variant="gray" icon={Pin}><>{message}</></Alert>,

};

export default BANNER_TYPE;
