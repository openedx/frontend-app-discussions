import React from 'react';
import PropTypes from 'prop-types';

import MathJax from 'react-mathjax-preview';

const baseConfig = {
  showMathMenu: true,
  tex2jax: {
    inlineMath: [
      ['$', '$'],
      ['\\(', '\\)'],
      ['[mathjaxinline]', '[/mathjaxinline]'],
    ],
    displayMath: [
      ['[mathjax]', '[/mathjax]'],
      ['$$', '$$'],
      ['\\[', '\\]'],
    ],
  },

  skipStartupTypeset: true,
};

function HTMLLoader({ htmlNode, componentId, cssClassName }) {
  const isLatex = htmlNode.match(/(\${1,2})((?:\\.|.)*)\1/)
                  || htmlNode.match(/(\[mathjax](.+?)\[\/mathjax])+/)
                  || htmlNode.match(/(\[mathjaxinline](.+?)\[\/mathjaxinline])+/)
                  || htmlNode.match(/(\\\[(.+?)\\\])+/)
                  || htmlNode.match(/(\\\((.+?)\\\))+/);

  return (
    isLatex ? (
      <MathJax
        math={htmlNode}
        id={componentId}
        className={cssClassName}
        sanitizeOptions={{ USE_PROFILES: { html: true } }}
        config={baseConfig}
      />
    )
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
