Autocomplete

```js
<div>
    <Autocomplete :suggestions="[
        { id: 'foo', label: 'Foo' },
        { id: 'bar', label: 'Bar' },
        { id: 'baz', label: 'Baz' },
        { id: 'buz', label: 'Buz' }
    ]"/>
</div>
```

Autocomplete

```js
<div>
    <Autocomplete
        :sections="[
            { id: 'all', label: 'All' },
            { id: 'others', label: 'Others' }
        ]"
        :suggestions="[
            { id: 'foo', label: 'Foo', section: 'all' },
            { id: 'bar', label: 'Bar', section: 'all' },
            { id: 'ofoo', label: 'Other Foo', section: 'others' },
            { id: 'obar0', label: 'Other Bar', section: 'others' },
            { id: 'obar1', label: 'Other Bar', section: 'others' },
            { id: 'obar2', label: 'Other Bar', section: 'others' },
            { id: 'obar3', label: 'Other Bar', section: 'others' },
            { id: 'obar4', label: 'Other Bar', section: 'others' },
            { id: 'obar5', label: 'Other Bar', section: 'others' },
            { id: 'obar6', label: 'Other Bar', section: 'others' },
            { id: 'obar7', label: 'Other Bar', section: 'others' },
            { id: 'obar8', label: 'Other Bar', section: 'others' },
            { id: 'obar9', label: 'Other Bar', section: 'others' },
            { id: 'obar10', label: 'Other Bar', section: 'others' },
            { id: 'obar11', label: 'Other Bar', section: 'others' },
            { id: 'obar12', label: 'Other Bar', section: 'others' },
            { id: 'obar13', label: 'Other Bar', section: 'others' },
            { id: 'obar14', label: 'Other Bar', section: 'others' }
        ]"
    />
</div>
```

Using label and v-model:
```js
new Vue({
  data: () => ({
      selected: 'foo'
  }),
  template: `
    <div>
        Selected: {{ selected }}
        <br/>
        <br/>
        <Autocomplete
            label="My Autocomplete"
            v-model="selected"
            :suggestions="[
                { id: 'foo', label: 'Foo' },
                { id: 'bar', label: 'Bar' },
                { id: 'baz', label: 'Baz' },
                { id: 'buz', label: 'Buz' }
            ]"
        />
    </div>
  `
})
```

Using label and v-model + sections:
```js
new Vue({
  data: () => ({
      selected: 'foo'
  }),
  template: `
    <div>
        Selected: {{ selected }}
        <br/>
        <br/>
        <Autocomplete
            label="My Autocomplete"
            v-model="selected"
            :sections="[
                { id: 'all', label: 'All' },
                { id: 'others', label: 'Others' }
            ]"
            :suggestions="[
                { id: 'foo', label: 'Foo', section: 'all' },
                { id: 'bar', label: 'Bar', section: 'all' },
                { id: 'ofoo', label: 'Other Foo', section: 'others' },
                { id: 'obar', label: 'Other Bar', section: 'others' }
            ]"
        />
    </div>
  `
})
```
