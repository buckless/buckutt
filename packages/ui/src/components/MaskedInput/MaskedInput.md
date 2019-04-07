This component is using [cleave.js](https://nosir.github.io/cleave.js/)

```js
<div>
    <MaskedInput :options="{ creditCard: true }" />
</div>
```

Date formatting

```js
<div>
    <MaskedInput
        label="Date"
        placeholder="dd/mm/yyyy"
        :options="{
            date: true,
            delimiter: '/',
            datePattern: ['d', 'm', 'Y']
        }"
    />
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
      <MaskedInput :options="{ date: true }" v-model="name"/> Hello {{ name }}
    </div>
  `
})
```
