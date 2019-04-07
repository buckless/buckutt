Tabs

```js
const { Tab } = require('./Tabs')

new Vue({
  components: { Tab },
  data: () => ({
      selected: 2
  }),
  template: `
    <div>
      <Tabs v-model="selected">
        <Tab title="Tab 1">
          Content 1
        </Tab>
        <Tab title="Tab 2">
          Content 2
        </Tab>
        <Tab title="Tab 3">
          Content 3
        </Tab>
        <Tab title="Tab 4">
          Content 4
        </Tab>
      </Tabs>
    </div>
  `
})
```
