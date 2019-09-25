Default example:

```js
import Icon from '../Icon/Icon';

<div>
    <Button>
        Hello
    </Button>

    <Button raised>
        Hello
    </Button>

    <Button raised>
        <Icon name="favorite" />
    </Button>

    <Button accent>
        Accent
    </Button>

    <Button raised accent>
        Accent and Raised
    </Button>
</div>
```

Disabled state:

```js
<div>
    <Button disabled>
        Hello
    </Button>

    <Button raised disabled>
        Hello
    </Button>

    <Button disabled accent>
        Accent
    </Button>

    <Button disabled raised accent>
        Accent and Raised
    </Button>
</div>
```

Using router-link example:

```js
<div>
    <Button to="/">
        Linker
    </Button>

    <Button raised to="/">
        Link raised
    </Button>

    <Button accent to="/">
        Link accent
    </Button>

    <Button raised accent to="/">
        Link accent and raised
    </Button>
</div>
```
