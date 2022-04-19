import hljs from 'highlight.js/lib/core';
import javascript from 'highlight.js/lib/languages/javascript';

hljs.registerLanguage('javascript', javascript);

export const renderCode = async (url, node) => {
  const page = await fetch(url);
  const result = await page.text();

  const domNode = document.querySelector(node);
  domNode.textContent = result;
  hljs.highlightElement(domNode);
};
