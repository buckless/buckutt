export const isSuggestion = suggestion =>
    suggestion && typeof suggestion.label === 'string' && typeof suggestion.id === 'string';

export const isSuggestions = suggestions =>
    Array.isArray(suggestions) &&
    suggestions.map(isSuggestion).reduce((left, right) => left && right, true);

export const isSection = section =>
    section && typeof section.label === 'string' && typeof section.id === 'string';

export const isSections = sections =>
    Array.isArray(sections) && sections.map(isSection).reduce((left, right) => left && right, true);

export const matches = (input, entry) => entry.toLowerCase().includes(input.toLowerCase());
