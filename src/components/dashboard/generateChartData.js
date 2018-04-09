export default (curvesData, unit, colorsPattern) => {
    const curves = {};
    const colors = {};

    if (curvesData.yAxis) {
        for (let i = 1; i <= curvesData.yAxis.length; i += 1) {
            curves[`Courbe ${i}`] = curvesData.yAxis[i - 1].map(values => values[unit]);
            colors[`Courbe ${i}`] = colorsPattern[i - 1];
        }
    }

    return {
        x: 'x',
        xLocaltime: false,
        xFormat: '%Y-%m-%dT%H:%M:%S.%LZ',
        json: {
            x: curvesData.xAxis,
            ...curves
        },
        colors
    };
};
