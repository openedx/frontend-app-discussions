import React from 'react';
import PropTypes from 'prop-types';

import MathJax from 'react-mathjax-preview';

const baseConfig = {
  showMathMenu: true,
  tex2jax: {
    inlineMath: [
      ['$', '$'],
      ['\\\\(', '\\\\)'],
      ['\\(', '\\)'],
      ['[mathjaxinline]', '[/mathjaxinline]'],
      ['\\begin{math}', '\\end{math}'],
    ],
    displayMath: [
      ['[mathjax]', '[/mathjax]'],
      ['$$', '$$'],
      ['\\\\[', '\\\\]'],
      ['\\[', '\\]'],
      ['\\begin{displaymath}', '\\end{displaymath}'],
      ['\\begin{equation}', '\\end{equation}'],
    ],
  },

  skipStartupTypeset: true,
};

function HTMLLoader({ htmlNode, componentId, cssClassName }) {
  const isLatex = htmlNode.match(/(\${1,2})((?:\\.|.)*)\1/)
                  || htmlNode.match(/(\[mathjax](.+?)\[\/mathjax])+/)
                  || htmlNode.match(/(\[mathjaxinline](.+?)\[\/mathjaxinline])+/)
                  || htmlNode.match(/(\\begin\{math}(.+?)\\end\{math})+/)
                  || htmlNode.match(/(\\begin\{displaymath}(.+?)\\end\{displaymath})+/)
                  || htmlNode.match(/(\\begin\{equation}(.+?)\\end\{equation})+/)
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
