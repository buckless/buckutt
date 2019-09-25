Table

```js
new Vue({
  data: () => ({
      rows: [
        { id: 'a', title: 'Hello' },
        { id: 'b', icon: 'shopping_cart', title: 'Hello', subtitle: 'World' },
        { id: 'c', icon: 'shopping_cart', title: 'Hello', subtitle: 'World', right: '+50.00€' },
        { id: 'd', icon: 'shopping_cart', title: 'Hello', subtitle: 'World', rightIcon: 'delete' }
      ]
  }),
  methods: {
    alert(msg) { alert(msg) },
    action(msg) { alert(`action ${msg}`) }
  },
  template: `
    <div>
        <Table
            :rows="rows"
            @click="alert"
            @action="action"
        />
    </div>
  `
})
```

