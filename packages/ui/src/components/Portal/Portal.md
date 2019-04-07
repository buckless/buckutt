Portal

The element is actually living in body and artificially maintened in the vue tree.

```js
new Vue({
  data: () => ({
      active: true,
      name: 'World'
  }),

  mounted() {
    setTimeout(() => this.name = 'Worlder', 2000)
    setTimeout(() => this.active = false, 5000)
  },

  template: `
    <div v-if="active">
        <Portal style="position: fixed; top: 100px; right: 100px;">
            Hello {{ name }}
        </Portal>
    </div>
  `
})
```
