## Usage

```css
.component {
    background-color: var(--primary-400);
    color: var(--dark-foreground-400);
}
```

### Available colors

Four main categories exist: `grey` (background elements), `foreground` (text color), `primary` (theme's main color) and `accent` (theme's accent color).
There is also `success`, `warning` and `error`.

Colors are classified through a number that goes from 0 to 999 which indicates the lightness of the color. The lower the lighter, the bigger the darker.
The "root" color for primary and accent is 400.

#### Foreground

**Foreground rule for primary**

On primary background, foreground is dark from `--primary-50` to `--primary-200`, and light from `--primary-300` to `--primary-900`.

**Foreground rule for accent**

On accent background, foreground is dark from `--accent-50` to `--accent-800`, and light only for `--accent-900`.

```js noeditor
<div>
    <Color fg="--foreground-light-100" bg="--primary-500" main="fg" />
    <Color fg="--foreground-light-200" bg="--primary-500" main="fg" />
    <Color fg="--foreground-light-300" bg="--primary-500" main="fg" />

    <Color fg="--foreground-dark-100" bg="--primary-200" main="fg" />
    <Color fg="--foreground-dark-200" bg="--primary-200" main="fg" />
    <Color fg="--foreground-dark-300" bg="--primary-200" main="fg" />
</div>
```

```css
--foreground-light-100: rgba(255,255,255,.50);
--foreground-light-200: rgba(255,255,255,.71);
--foreground-light-300: rgba(255,255,255,.87);

--foreground-dark-100: rgba(0,0,0,.50);
--foreground-dark-200: rgba(0,0,0,.71);
--foreground-dark-300: rgba(0,0,0,.87);
```

#### Greys

```js noeditor
<div>
    <Color fg="--foreground-dark-300" bg="--grey-50" main="bg" />
    <Color fg="--foreground-dark-300" bg="--grey-100" main="bg" />
    <Color fg="--foreground-dark-300" bg="--grey-200" main="bg" />
    <Color fg="--foreground-dark-300" bg="--grey-300" main="bg" />
    <Color fg="--foreground-dark-300" bg="--grey-400" main="bg" />
    <Color fg="--foreground-dark-300" bg="--grey-500" main="bg" />
    <Color fg="--foreground-dark-300" bg="--grey-600" main="bg" />
</div>
```

```css
--grey-50: #fff;
--grey-100: #fcfcfd;
--grey-200: #f2f2f3;
--grey-300: #ececed;
--grey-400: #eaeaeb;
--grey-500: #e6e6e7;
--grey-600: #e3e3e4;
```

#### Primary

```js noeditor
<div>
    <Color fg="--foreground-dark-300" bg="--primary-50" main="bg" />
    <Color fg="--foreground-dark-300" bg="--primary-100" main="bg" />
    <Color fg="--foreground-dark-300" bg="--primary-200" main="bg" />
    <Color fg="--foreground-light-300" bg="--primary-300" main="bg" />
    <Color fg="--foreground-light-300" bg="--primary-400" main="bg" />
    <Color fg="--foreground-light-300" bg="--primary-500" main="bg" />
    <Color fg="--foreground-light-300" bg="--primary-600" main="bg" />
</div>
```

```css
--primary-50: #e8ebfb;
--primary-100: #c4cdf6;
--primary-200: #9cadf0;
--primary-300: #708cea;
--primary-400: #5469af;
--primary-500: #384675;
--primary-600: #1c233b;
```

#### Accent

```js noeditor
<div>
    <Color fg="--foreground-dark-300" bg="--accent-50" main="bg" />
    <Color fg="--foreground-dark-300" bg="--accent-100" main="bg" />
    <Color fg="--foreground-dark-300" bg="--accent-200" main="bg" />
    <Color fg="--foreground-dark-300" bg="--accent-300" main="bg" />
    <Color fg="--foreground-dark-300" bg="--accent-400" main="bg" />
    <Color fg="--foreground-dark-300" bg="--accent-500" main="bg" />
    <Color fg="--foreground-dark-300" bg="--accent-600" main="bg" />
    <Color fg="--foreground-dark-300" bg="--accent-700" main="bg" />
    <Color fg="--foreground-dark-300" bg="--accent-800" main="bg" />
    <Color fg="--foreground-light-300" bg="--accent-900" main="bg" />
</div>
```

```css
--accent-50: #e3faee;
--accent-100: #bbf1d4;
--accent-200: #8ae9b9;
--accent-300: #47e09b;
--accent-400: #00d783;
--accent-500: #00ce6e;
--accent-600: #00bd63;
--accent-700: #00aa55;
--accent-800: #009849;
--accent-900: #007733;
```

#### Status colors

```js noeditor
<div>
    <Color fg="--foreground-dark-300" bg="--error-200" main="bg" />
    <Color fg="--foreground-dark-300" bg="--error-300" main="bg" />
    <Color fg="--foreground-dark-300" bg="--warning-200" main="bg" />
    <Color fg="--foreground-dark-300" bg="--warning-300" main="bg" />
    <Color fg="--foreground-dark-300" bg="--success-200" main="bg" />
    <Color fg="--foreground-dark-300" bg="--success-300" main="bg" />
</div>
```

```css
--error-200: #ff8f7c;
--error-300: #f75d4f;

--warning-200: #ffd95f;
--warning-300: #ffa72b;

--success-200: #8dff9b;
--success-300: #54e26b;
```

## Modification

If you ever need to change a color from the theme, please edit file `packages/ui/src/theme.json` and run `yarn ui theme` to regenerate the css theme file.
