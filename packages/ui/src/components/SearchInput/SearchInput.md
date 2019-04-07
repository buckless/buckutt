SearchInput

```js
<div>
    <SearchInput />
</div>
```

Using v-model:
```js
new Vue({
  data: () => ({
      name: 'World'
  }),
  template: `
    <div>
      <SearchInput v-model="name"/> Hello {{ name }}
    </div>
  `
})
```
