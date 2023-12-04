import Prism from 'prismjs';

const parseTextForCodeBlocks = (text) => {
  const elements = [];
  let lastIndex = 0;
  const regex = /```([\w]+)?\n([\s\S]+?)```/g;
  let match;

  while ((match = regex.exec(text)) !== null) {
    const [fullMatch, lang, code] = match;
    const textBetweenMatches = text.slice(lastIndex, regex.lastIndex - fullMatch.length);

    elements.push(<span key={lastIndex}>{textBetweenMatches}</span>);

    lastIndex = regex.lastIndex;

    let highlightedCode;
    try {
      if (lang && Prism.languages[lang]) {
        highlightedCode = Prism.highlight(code, Prism.languages[lang], lang);
      } else {
        highlightedCode = code;
      }
    } catch (e) {
      highlightedCode = code;
    }

    elements.push(
      <pre key={lastIndex}>
        <code className={lang ? `language-${lang}` : ''} dangerouslySetInnerHTML={{ __html: highlightedCode }} />
      </pre>
    );
  }

  elements.push(<span key={lastIndex}>{text.slice(lastIndex)}</span>);
  return elements;
};


export default parseTextForCodeBlocks;
