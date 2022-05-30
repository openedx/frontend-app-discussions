// eslint-disable react/no-danger
import React from 'react';
import PropTypes from 'prop-types';

import { MathJax } from 'better-react-mathjax';

function HTMLLoader({ htmlNode, componentId, cssClassName }) {
  return (
    <MathJax>
      <div className={cssClassName} id={componentId} dangerouslySetInnerHTML={{ __html: htmlNode }} />
    </MathJax>
  );
}

HTMLLoader.propTypes = {
  htmlNode: PropTypes.node.isRequired,
  componentId: PropTypes.string,
  cssClassName: PropTypes.string,
};

HTMLLoader.defaultProps = {
  componentId: null,
  cssClassName: '',
};

export default HTMLLoader;
