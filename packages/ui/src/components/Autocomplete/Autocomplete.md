A section looks like:
```js static
{
    name: 'section1', // id of first section
    label: 'Section 1', // label of first section,
    data: [
        { id: 'foo', label: 'Foo' } // first item of first section
    ]
}
```

If you don't want any section, then omit `name` and `label`.


Autocomplete

```js
<div>
    <Autocomplete :suggestions="[
        {
            name: 'all',
            label: 'All',
            data: [ { id: 'foo', label: 'Foo' }, { id: 'bar', label: 'Bar' } ],
        },
        {
            name: 'others',
            label: 'Others',
            data: [ { id: 'ofoo', label: 'Other Foo' }, { id: 'obar', label: 'Other Bar' } ]
        }
    ]"/>
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
        <Autocomplete
            label="My Autocomplete"
            v-model="selected"
            :suggestions="[
                {
                    name: 'all',
                    label: 'All',
                    data: [ { id: 'foo', label: 'Foo' }, { id: 'bar', label: 'Bar' } ],
                },
                {
                    name: 'others',
                    label: 'Others',
                    data: [ { id: 'ofoo', label: 'Other Foo' }, { id: 'obar', label: 'Other Bar' } ]
                }
            ]
        "/>
    </div>
  `
})
```
