import React from 'react';
import PropTypes from 'prop-types';

import { Button, Icon } from '@edx/paragon';
import { Search } from '@edx/paragon/icons';

function SearchInfo({ count, text, onClear }) {
  return (
    <div className="d-flex flex-row">
      <Icon src={Search} className="justify-content-start ml-3.5 mr-2 mb-2 mt-2.5" />
      <Button variant="" size="inline">Showing {count} results for &quot;{text}&quot; </Button>
      <Button variant="link" size="inline" className="ml-auto mr-4" onClick={onClear}>Clear</Button>
    </div>
  );
}

SearchInfo.propTypes = {
  count: PropTypes.number.isRequired,
  text: PropTypes.string.isRequired,
  onClear: PropTypes.func,
};

SearchInfo.defaultProps = {
  onClear: () => {},
};

export default SearchInfo;
