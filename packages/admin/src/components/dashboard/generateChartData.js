const canvas = document.createElement('canvas');
document.body.appendChild(canvas);
canvas.style.display = 'none';
const ctx = canvas.getContext('2d');

const createGradient = hexa => {
    const hex = hexa.replace('#', '');
    const r = parseInt(hex.substring(0, hex.length / 3), 16);
    const g = parseInt(hex.substring(hex.length / 3, (2 * hex.length) / 3), 16);
    const b = parseInt(hex.substring((2 * hex.length) / 3, (3 * hex.length) / 3), 16);
    const color1 = `rgba(${r},${g},${b},0.3)`;
    const color2 = `rgba(${r},${g},${b},0.05)`;

    const gradient = ctx.createLinearGradient(0, 0, 0, 500);
    gradient.addColorStop(0, color1);
    gradient.addColorStop(1, color2);

    return gradient;
};

export default (curvesData, unit, colorsPattern) => {
    if (!curvesData.xAxis || !curvesData.yAxis) {
        return {};
    }

    return {
        labels: curvesData.xAxis.map(x => new Date(x)),
        datasets: curvesData.yAxis.map((y, index) => ({
            label: `Courbe ${index + 1}`,
            backgroundColor: createGradient(colorsPattern[index]),
            borderColor: colorsPattern[index],
            data: y.map(values => (unit === 'amount' ? values[unit] / 100 : values[unit])),
            fill: true,
            opacity: 0.3
        }))
    };
};
