Basic input

```js
<div>
    <Input
        label="Hello"
        placeholder="Enter your name"
    />
</div>
```

Disabled state
```js
<div>
    <Input
        label="Hello"
        placeholder="Disabled state"
        disabled
    />
</div>
```

Invalid state
```js
<div>
    <Input
        label="Hello"
        placeholder="Enter your name"
        value="33"
        pattern="[a-zA-Z]+"
    />
</div>
```

With elevation
```js
<div>
    <Input
        label="Hello"
        placeholder="Enter your name"
        value="33"
        elevation
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
      <Input v-model="name"/> Hello {{ name }}
    </div>
  `
})
```
