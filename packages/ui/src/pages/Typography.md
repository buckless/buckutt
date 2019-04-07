## Usage

### Font families

We're only using one font family, [Oxygen](https://fonts.google.com/specimen/Oxygen).

The variable is defined usable like this:

```js noeditor
<FontSize
    inside="'Oxygen', 'Roboto', 'Open-Sans', sans-serif"
/>
```

```css
--typography-family: 'Oxygen', 'Roboto', 'Open-Sans', sans-serif;
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
    font-size: var(--typography-body-1-size); /* 16px */
    letter-spacing: var(--typography-body-1-spacing); /* 0.5px */
    font-weight: var(--typography-body-1-weight); /* normal */
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
    font-size: var(--typography-body-2-size); /* 14px */
    letter-spacing: var(--typography-body-2-spacing); /* 0.25px */
    font-weight: var(--typography-body-2-weight); /* normal */
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
    font-size: var(--typography-button-size); /* 14px */
    letter-spacing: var(--typography-button-spacing); /* 1.25px */
    font-weight: var(--typography-button-weight); /* bold */
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
    font-size: var(--typography-h1-size); /* 92px */
    letter-spacing: var(--typography-h1-spacing); /* -1.5px */
    font-weight: var(--typography-h1-weight); /* bold */
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
    font-size: var(--typography-h2-size); /* 58px */
    letter-spacing: var(--typography-h2-spacing); /* -0.5px */
    font-weight: var(--typography-h2-weight); /* bold */
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
    font-size: var(--typography-h3-size); /* 47px */
    letter-spacing: var(--typography-h3-spac); /* 0px */
    font-weight: var(--typography-h3-weight); /* bold */
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
    font-size: var(--typography-h4-size); /* 33px */
    letter-spacing: var(--typography-h4-spacin); /* 0.25px */
    font-weight: var(--typography-h4-weight); /* bold */
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
    font-size: var(--typography-h5-size); /* 23px */
    letter-spacing: var(--typography-h5-spac); /* 0px */
    font-weight: var(--typography-h5-weight); /* bold */
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
    font-size: var(--typography-h6-size); /* 19px */
    letter-spacing: var(--typography-h6-spacing); /* 0.25px */
    font-weight: var(--typography-h6-weight); /* bold */
}
```
