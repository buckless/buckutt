```js
<div>
    <DateTimeInput
        label="Date"
    />
</div>
```

Only dates
```js
<div>
    <DateTimeInput
        label="Date"
        :time="false"
    />
</div>
```

Boundaries
```js
const min = new Date(); min.setDate(min.getDate() - 3);
const max = new Date(); max.setDate(max.getDate() + 3);

new Vue({
  data: () => ({
      date: new Date(),
      min,
      max
  }),
  template: `
    <div>
      <DateTimeInput label="Date" :min="min" :max="max"/>
    </div>
  `
})
```

Using v-model:
```js
new Vue({
  data: () => ({
      date: new Date()
  }),
  template: `
    <div>
      <DateTimeInput label="Date" v-model="date"/>
      <br/>
      {{ date }}
    </div>
  `
})
```
