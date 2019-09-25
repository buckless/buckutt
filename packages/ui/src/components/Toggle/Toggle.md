Toggle

```js
<div>
    <Toggle>I have read the manual</Toggle>
</div>
```

Accent
```js
<div>
    <Toggle accent>I have read the manual</Toggle>
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
      <Toggle v-model="active">Status: {{ active ? 'on' : 'off' }}</Toggle>
    </div>
  `
})
```
