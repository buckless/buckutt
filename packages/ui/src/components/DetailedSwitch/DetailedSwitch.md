DetailedSwitch

```js
<div>
    <DetailedSwitch label="Some setting" icon="home">
        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
    </DetailedSwitch>
</div>
```
Using v-model:
```js
new Vue({
  data: () => ({
      active: true
  }),
  template: `
    <DetailedSwitch label="Some setting" icon="home" v-model="active">
        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
        Active: {{ active }}
    </DetailedSwitch>
  `
})
```
