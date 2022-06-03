import React from 'react';
import PropTypes from 'prop-types';

import MathJax from 'react-mathjax-preview';

function HTMLLoader({ htmlNode, componentId, cssClassName }) {
  const isLatex = htmlNode.match(/(\${1,2})((?:\\.|.)*)\1/)
                  || htmlNode.match(/(\[mathjax](.+?)\[\\mathjax])+/)
                  || htmlNode.match(/(\[mathjaxinline](.+?)\[\\mathjaxinline])+/)
                  || htmlNode.match(/(\\\[(.+?)\\\])+/);

  return (
    isLatex ? <MathJax math={htmlNode} id={componentId} className={cssClassName} />
      // eslint-disable-next-line react/no-danger
      : <div className={cssClassName} id={componentId} dangerouslySetInnerHTML={{ __html: htmlNode }} />
  );
}

HTMLLoader.propTypes = {
  htmlNode: PropTypes.node,
  componentId: PropTypes.string,
  cssClassName: PropTypes.string,
};

HTMLLoader.defaultProps = {
  htmlNode: '',
  componentId: null,
  cssClassName: '',
};

export default HTMLLoader;
