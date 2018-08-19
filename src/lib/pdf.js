import PDF from 'jspdf';
import 'jspdf-autotable';

const splitRegex = /\r\n|\r|\n/g;

PDF.API.addText = function(text, x, y, hAlign = 'left', vAlign = 'bottom') {
    const fontSize = this.internal.getFontSize() / this.internal.scaleFactor;

    // As defined in jsPDF source code
    const lineHeightProportion = 1.15;

    let splittedText = null;
    let lineCount = 1;

    if (vAlign === 'middle' || vAlign === 'bottom' || hAlign === 'center' || hAlign === 'right') {
        splittedText = typeof text === 'string' ? text.split(splitRegex) : text;

        lineCount = splittedText.length || 1;
    }

    // Align the top
    y += fontSize * (2 - lineHeightProportion);

    if (vAlign === 'middle') {
        y -= (lineCount / 2) * fontSize;
    } else if (vAlign === 'bottom') {
        y -= lineCount * fontSize;
    }

    if (hAlign === 'center' || hAlign === 'right') {
        let alignSize = fontSize;

        if (hAlign === 'center') {
            alignSize *= 0.5;
        }

        if (lineCount > 1) {
            for (let iLine = 0; iLine < splittedText.length; iLine++) {
                this.text(
                    splittedText[iLine],
                    x - this.getStringUnitWidth(splittedText[iLine]) * alignSize,
                    y
                );
                y += fontSize;
            }

            return this;
        }

        x -= this.getStringUnitWidth(text) * alignSize;
    }

    this.text(text, x, y);
    return this;
};

window.PDF = PDF;

export default PDF;
