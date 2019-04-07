const path = require('path');
const fs = require('fs-extra');
const launchEditor = require('launch-editor');

async function main() {
    const components = path.join(__dirname, '..', 'src', 'components');

    if (!process.argv[2] || !process.argv[2].length) {
        throw new Error('Missing component name');
    }

    const name = process.argv[2].trim();
    const dir = path.join(components, name);
    const mdPath = path.join(dir, `${name}.md`);
    const vuePath = path.join(dir, `${name}.vue`);

    const templateMd = `${name}

\`\`\`js
<div>
    <${name} />
</div>
\`\`\`
`;

    const templateVue = `<template>
    <div>Hello World</div>
</template>

<script>
export default {
    name: '${name}'
};
</script>

<style scoped>
</style>
`;

    await fs.mkdirp(path.join(components, name));
    await Promise.all([fs.writeFile(mdPath, templateMd), fs.writeFile(vuePath, templateVue)]);

    await Promise.all([launchEditor(mdPath), launchEditor(vuePath)]);
}

main();
