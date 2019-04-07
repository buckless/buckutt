export const styles = position => {
    if (!position) return;

    return {
        transform: `translateX(${position.left}px) scaleX(${position.width / 100})`
    };
};

export const positions = tabs => {
    let left = 0;

    return Array.from(tabs.children)
        .filter(child => child.classList.contains('tab'))
        .map(child => {
            const width = child.getBoundingClientRect().width;
            const pos = { left, width };

            left += width;

            return pos;
        });
};
