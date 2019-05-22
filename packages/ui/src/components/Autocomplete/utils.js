export const isSuggestion = suggestion =>
    suggestion && typeof suggestion.label === 'string' && typeof suggestion.id === 'string';

export const isSuggestions = suggestions =>
    Array.isArray(suggestions) &&
    suggestions.map(isSuggestion).reduce((left, right) => left && right, true);

export const isSections = sections =>
    Array.isArray(sections) &&
    sections
        .map(section => section && isSuggestions(section.data))
        .reduce((left, right) => left && right, true);

export const matches = (input, entry) => entry.toLowerCase().includes(input.toLowerCase());
