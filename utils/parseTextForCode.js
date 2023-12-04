import Prism from 'prismjs';
import React from 'react';

const parseTextForCode = (text, codeBlockRef, langLabelRef) => {
  const elements = [];
  let lastIndex = 0;
  const regex = /```([\w]+)?\n([\s\S]+?)```/g;
  let match;

  const createElementsFromText = (inputText) => {
    return inputText.split('\n').map((line, i) => (
      <React.Fragment key={`line-${i}`}>
        {line}
        <br />
      </React.Fragment>
    ));
  };

  while ((match = regex.exec(text)) !== null) {
    const [fullMatch, lang, code] = match;
    const textBetweenMatches = text.slice(lastIndex, regex.lastIndex - fullMatch.length);

    elements.push(
      <span key={lastIndex} className="text-span">{createElementsFromText(textBetweenMatches)}</span>
    );

    lastIndex = regex.lastIndex;

    let highlightedCode;
    try {
      if (lang && Prism.languages[lang]) {
        highlightedCode = Prism.tokenize(code, Prism.languages[lang]);
      } else {
        highlightedCode = [code];
      }
    } catch (e) {
      highlightedCode = [code];
    }

    const renderedTokens = highlightedCode.map((token, i) => {
      if (typeof token === 'string') {
        return token;
      }
      return React.createElement('span', { className: `token ${token.type}`, key: i }, token.content);
    });

    elements.push(
      <>
        {lang && <span ref={langLabelRef} className='lang-label'>{lang}</span>}
        <div ref={codeBlockRef} key={`div-${lastIndex}`} className='code-block'>
          <pre key={`pre-${lastIndex}`}>
            <code>{renderedTokens}</code>
          </pre>
        </div>
      </>
    );
  }

  elements.push(
    <span key={lastIndex} className="text-span">{createElementsFromText(text.slice(lastIndex))}</span>
  );

  return elements;
};

export default parseTextForCode;
