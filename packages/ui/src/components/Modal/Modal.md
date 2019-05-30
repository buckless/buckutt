Modal

```js
<div>
    <Modal>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
    </Modal>
</div>
```

With title and actions

```js
import Button from '../Button/Button';

<div>
    <Modal title="My Modal">
        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.

        <template slot="actions">
            <Button>Cancel</Button>
            <Button raised accent>Validate</Button>
        </template>
    </Modal>
</div>
```


With container

```js
import ModalContainer from './Container';
import Button from '../Button/Button';

new Vue({
  components: { ModalContainer, Button },
  data: () => ({
      opened: false
  }),
  template: `
    <div>
      <Button @click="opened = true">Open</Button>
      <ModalContainer v-if="opened" @close="opened = false">
        <Modal
            title="Dialog modal"
            @close="opened = false"
        >
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.

            <template slot="actions">
                <Button @click="opened = false">Cancel</Button>
                <Button @click="opened = false" raised accent>Validate</Button>
            </template>
        </Modal>
      </ModalContainer>
    </div>
  `
})

```
