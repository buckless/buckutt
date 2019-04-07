Checkbox

```js
<div>
    <Checkbox>I have read the manual</Checkbox>
</div>
```

Right-aligned
```js
<div>
    <Checkbox right>I have read the manual</Checkbox>
</div>
```

Accent
```js
<div style="display: flex; justify-content: space-between;">
    <Checkbox accent>I have read the manual</Checkbox>
    <Checkbox accent right>I have read the manual</Checkbox>
</div>
```

Using v-model:
```js
new Vue({
  data: () => ({
      active: true
  }),
  template: `
    <div>
      <Checkbox v-model="active">Status: {{ active ? 'on' : 'off' }}</Checkbox>
    </div>
  `
})
```
