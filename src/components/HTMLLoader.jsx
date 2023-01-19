import React, { useEffect, useRef, useState } from 'react';
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
    processEnvironments: true,
  },

  skipStartupTypeset: true,
};

const defaultSanitizeOptions = {
  USE_PROFILES: { html: true, mathMl: true },
  ADD_ATTR: ['columnalign'],
};

function HTMLLoader({ htmlNode, componentId, cssClassName }) {
  const [loadingState, setLoadingState] = useState(window.MathJax ? 'loaded' : 'loading');
  const sanitizedMath = DOMPurify.sanitize(htmlNode, { ...defaultSanitizeOptions });
  const previewRef = useRef();
  const mathjaxScript = 'https://cdnjs.cloudflare.com/ajax/libs/mathjax/2.7.7/MathJax.js?config=TeX-MML-AM_HTMLorMML';

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
    previewRef.current.innerHTML = sanitizedMath;
    window.MathJax.Hub.Queue([
      'Typeset',
      window.MathJax.Hub,
      previewRef.current,
    ]);
  }, [sanitizedMath, loadingState, previewRef]);

  return (
    <div ref={previewRef}>
      {/* eslint-disable-next-line react/no-danger */}
      <div className={cssClassName} id={componentId} dangerouslySetInnerHTML={{ __html: htmlNode }} />
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
