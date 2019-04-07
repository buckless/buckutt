Notification

```js
<div>
    <Notification>
        Hello World!
    </Notification>
</div>
```

With action
```js
new Vue({
  methods: {
      onAction: (...args) => console.log(args)
  },
  template: `
    <div>
        <Notification action="Action" @action="onAction">
            Hello World!
        </Notification>
    </div>
  `
})
```
