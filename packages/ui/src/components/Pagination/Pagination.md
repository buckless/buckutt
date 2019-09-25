Pagination

```js
import Table from '../Table/Table';

const allRows = Array(100).fill({}).map((_, i) => ({
    id: i,
    icon: 'shopping_card',
    title: `Hello row ${i + 1}`,
    right: `+${Math.floor(Math.random() * 50) + 1}.00€`
}))

new Vue({
  components: { Table },
  data: () => ({
      allRows
  }),
  template: `
    <div>
        <Pagination :rows="allRows" v-slot="{ rows }">
            <Table :rows="rows" />
        </Pagination>
    </div>
  `
})
```
