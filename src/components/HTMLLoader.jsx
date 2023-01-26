import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';

import DOMPurify from 'dompurify';

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
    processEscapes: true,
    processEnvironments: true,
  },
  skipStartupTypeset: false,
};

const defaultSanitizeOptions = {
  USE_PROFILES: { html: true },
  ADD_ATTR: ['columnalign'],
};

function HTMLLoader({ htmlNode, componentId, cssClassName }) {
  const [loadingState, setLoadingState] = useState(window.MathJax ? 'loaded' : 'loading');
  const sanitizedMath = DOMPurify.sanitize(htmlNode, { ...defaultSanitizeOptions });
  const mathjaxScript = 'https://cdnjs.cloudflare.com/ajax/libs/mathjax/2.7.7/MathJax.js?config=TeX-MML-AM_SVG';

  useEffect(() => {
    let mathjaxScriptTag = document.querySelector(`script[src="${mathjaxScript}"]`);
    if (!mathjaxScriptTag) {
      mathjaxScriptTag = document.createElement('script');
      mathjaxScriptTag.async = true;
      mathjaxScriptTag.src = mathjaxScript;

      const node = document.head || document.getElementsByTagName('head')[0];
      node.appendChild(mathjaxScriptTag);
    }
    const onloadHandler = () => {
      setLoadingState('loaded');
      window.MathJax.Hub.Config({ ...baseConfig });
    };
    const onerrorHandler = () => {
      setLoadingState('failed');
    };

    return () => {
      mathjaxScriptTag.removeEventListener('load', onloadHandler);
      mathjaxScriptTag.removeEventListener('error', onerrorHandler);
    };
  }, [setLoadingState, baseConfig]);

  useEffect(() => {
    if (loadingState !== 'loaded') {
      return;
    }
    window.MathJax.Hub.Queue([
      'Typeset',
      window.MathJax.Hub,
      'mathjax-code',
    ]);
  }, [sanitizedMath, loadingState]);

  return (
    <div id="mathjax-code">
      {/* eslint-disable-next-line react/no-danger */}
      <div className={cssClassName} id={componentId} dangerouslySetInnerHTML={{ __html: sanitizedMath }} />
    </div>
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
