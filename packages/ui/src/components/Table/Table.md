Table

```js
new Vue({
  data: () => ({
      rows: [
        { id: 'a', title: 'Hello' },
        { id: 'b', icon: 'shopping_cart', title: 'Hello', subtitle: 'World' },
        { id: 'c', icon: 'shopping_cart', title: 'Hello', subtitle: 'World', right: '+50.00€' }
      ]
  }),
  methods: {
    alert(msg) { alert(msg) }
  },
  template: `
    <div>
        <Table
            :rows="rows"
            @click="alert"
        />
    </div>
  `
})
```

