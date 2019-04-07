Select

```js
<div>
    <Select :options="[ 'a', 'b', 'c' ]"/>
</div>
```

Custom values:
```js
<div>
    <Select :options="[ { value: 'a', name: 'Option A' }, { value: 'b', name: 'Option B' }, { value: 'c', name: 'Option C' } ]"/>
</div>
```

With label:
```js
<div>
    <Select label="Options" :options="[ { value: 'a', name: 'Option A' }, { value: 'b', name: 'Option B' }, { value: 'c', name: 'Option C' } ]"/>
</div>
```

Using v-model:
```js
new Vue({
  data: () => ({
      value: 'b',
      options: [
        { value: 'a', name: 'Option A' },
        { value: 'b', name: 'Option B' },
        { value: 'c', name: 'Option C', disabled: true },
        { value: 'd', name: 'Option D' },
      ]
  }),
  template: `
    <div>
      <Select v-model="value" :options="options"/> Hello {{ value }}
    </div>
  `
})
```
