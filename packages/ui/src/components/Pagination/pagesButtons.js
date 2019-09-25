export const generateButtons = (currentPage, pagesNumber) => {
    const buttons = [];

    for (let i = 0; i <= pagesNumber; i += 1) {
        const showBecauseFirst = i === 0;
        const showBecauseLast = i === pagesNumber;
        const showBecauseNearCurrent = i - 1 <= currentPage && currentPage <= i + 1;

        const lastButtonIsDots = buttons.length > 0 && buttons[buttons.length - 1].isLink === false;

        if (showBecauseFirst || showBecauseLast || showBecauseNearCurrent) {
            buttons.push({ page: i + 1, isLink: true });
        } else if (!lastButtonIsDots) {
            buttons.push({ isLink: false });
        }
    }

    return buttons;
};
