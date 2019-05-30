## Usage

### Font families

We're only using one font family, [Open Sans](https://fonts.google.com/specimen/Open+Sans).

The variable is defined usable like this:

```js noeditor
<FontSize
    inside="'Open-Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol'"
/>
```

```css
/* https://getbootstrap.com/docs/4.3/content/reboot/#native-font-stack */
--typography-family:
    /* our font-family */
    'Open-Sans',
    /* Apple */
    -apple-system, BlinkMacSystemFont,
    /* Microsoft */
    'Segoe UI',
    /* Android */
    Roboto,
    /* Web */
    'Helvetica Neue', Arial, sans-serif,
    /* Emojis */
    'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol';
```

### Body

**Normal**

```js noeditor
<FontSize
    inside="Normal Body"
    size="--typography-body-1-size"
    weight="--typography-body-1-weight"
    ls="--typography-body-1-spacing"
/>
```

```css
body, p {
    font-size: var(--typography-body-1-size);
    letter-spacing: var(--typography-body-1-spacing);
    font-weight: var(--typography-body-1-weight);
}
```

**Small**

```js noeditor
<FontSize
    inside="Small Body"
    size="--typography-body-2-size"
    weight="--typography-body-2-weight"
    ls="--typography-body-2-spacing"
/>
```

```css
small {
    font-size: var(--typography-body-2-size);
    letter-spacing: var(--typography-body-2-spacing);
    font-weight: var(--typography-body-2-weight);
}
```

### Button

```js noeditor
<FontSize
    inside="Button"
    size="--typography-button-size"
    weight="--typography-button-weight"
    ls="--typography-button-spacing"
/>
```

```css
button {
    font-size: var(--typography-button-size);
    letter-spacing: var(--typography-button-spacing);
    font-weight: var(--typography-button-weight);
}
```

### Headers

**Header 1**

```js noeditor
<FontSize
    inside="Header 1"
    size="--typography-h1-size"
    weight="--typography-h1-weight"
    ls="--typography-h1-spacing"
/>
```

```css
h1 {
    font-size: var(--typography-h1-size);
    letter-spacing: var(--typography-h1-spacing);
    font-weight: var(--typography-h1-weight);
}
```

**Header 2**

```js noeditor
<FontSize
    inside="Header 2"
    size="--typography-h2-size"
    weight="--typography-h2-weight"
    ls="--typography-h2-spacing"
/>
```

```css
h2 {
    font-size: var(--typography-h2-size);
    letter-spacing: var(--typography-h2-spacing);
    font-weight: var(--typography-h2-weight);
}
```

**Header 3**

```js noeditor
<FontSize
    inside="Header 3"
    size="--typography-h3-size"
    weight="--typography-h3-weight"
    ls="--typography-h3-spacing"
/>
```

```css
h3 {
    font-size: var(--typography-h3-size);
    letter-spacing: var(--typography-h3-spac);
    font-weight: var(--typography-h3-weight);
}
```

**Header 4**

```js noeditor
<FontSize
    inside="Header 4"
    size="--typography-h4-size"
    weight="--typography-h4-weight"
    ls="--typography-h4-spacing"
/>
```

```css
h4 {
    font-size: var(--typography-h4-size);
    letter-spacing: var(--typography-h4-spacin);
    font-weight: var(--typography-h4-weight);
}
```

**Header 5**

```js noeditor
<FontSize
    inside="Header 5"
    size="--typography-h5-size"
    weight="--typography-h5-weight"
    ls="--typography-h5-spacing"
/>
```

```css
h5 {
    font-size: var(--typography-h5-size);
    letter-spacing: var(--typography-h5-spac);
    font-weight: var(--typography-h5-weight);
}
```

**Header 6**

```js noeditor
<FontSize
    inside="Header 6"
    size="--typography-h6-size"
    weight="--typography-h6-weight"
    ls="--typography-h6-spacing"
/>
```

```css
h6 {
    font-size: var(--typography-h6-size);
    letter-spacing: var(--typography-h6-spacing);
    font-weight: var(--typography-h6-weight);
}
```
