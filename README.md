# Requirements

- node@11
- pcsclite (libpcsclite1 + libpcsclite-dev)
- docker
- docker-compose

# Setup

```
cp packages/config/config.json.example packages/config/config.json
cd stack/
yarn
cd ..
sudo yarn stack setup:dev
```

# Running

```
yarn stack dev
```
