export const styles = position => {
    if (!position) return;

    return {
        transform: `translateX(${position.left}px) scaleX(${position.width / 100})`
    };
};

export const positions = sizes => {
    let left = 0;

    return sizes.map(width => {
        const pos = { left, width };

        left += width;

        return pos;
    });
};
