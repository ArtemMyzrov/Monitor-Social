
const HighlightedText = ({ text, keywords = [], className = "" }) => {
  const highlightKeywords = (text, keywords) => {
    if (!text || !keywords || keywords.length === 0) return text;

    let highlightedText = text;
    const sortedKeywords = [...keywords].sort((a, b) => b.length - a.length);

    sortedKeywords.forEach(keyword => {
      if (!keyword.trim()) return;

      const escapedKeyword = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(`(${escapedKeyword})`, 'gi');

      highlightedText = highlightedText.replace(
        regex,
        '<mark class="highlighted-keyword">$1</mark>'
      );
    });

    return highlightedText;
  };

  if (!text) return null;

  const highlightedHtml = highlightKeywords(text, keywords);

  return (
    <div
      className={`highlighted-text ${className}`}
      dangerouslySetInnerHTML={{ __html: highlightedHtml }}
    />
  );
};

export default HighlightedText;