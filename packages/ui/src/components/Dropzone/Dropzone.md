Dropzone

```js
new Vue({
  data: () => ({
      imgs: []
  }),

  methods: {
      setPreview(files) {
          const reader = new FileReader();

          files.forEach((file) => {
            const data = reader.readAsDataURL(file);
            reader.addEventListener('loadend', ({ target }) => {
                this.imgs.push(target.result)
            });
          });
      }
  },

  template: `
    <div>
      <Dropzone @files="setPreview"/>
      <p><strong>Results:</strong></p>
      <img v-for="(img, i) in imgs" :src="img" key="i" />
    </div>
  `
})
```
